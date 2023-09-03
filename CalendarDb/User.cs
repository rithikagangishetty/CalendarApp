using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Main.Supervisor;
using System.Collections.Generic;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Configuration;
using System.Threading;
using Main.Models;
using Main.Repository;



namespace CalendarDb
{
    public class User:IUser
    {
        private readonly IMongoCollection<UserData> _usersCollection;
        private readonly IConfiguration _configuration;
        private Timer? _reminderTimer;
        private readonly IConnection _connection;
        //setting up the connection with database
        public User(IConfiguration configuration, Connection connection)


        {
            _configuration = configuration;
           
            _connection = connection;
          var  mongoClient = new MongoClient(
                    _configuration["UserDatabase:ConnectionString"]);

           var mongoDatabase = mongoClient.GetDatabase(
               _configuration["UserDatabase:DatabaseName"]);

            _usersCollection = mongoDatabase.GetCollection<UserData>(
                 _configuration["UserDatabase:UsersCollectionName"]);
            
        }
        /// <summary>
        /// Set up the reminder timer to run the reminder task every 5 minutes
        /// </summary>
        public void StartReminderTimer()
        {
           
            _reminderTimer = new Timer(async state => await RunReminderTask(), null, TimeSpan.Zero, TimeSpan.FromMinutes(2));
        }

        /// <summary>
        /// Gets all the events of the specific user with the help of UserId.
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>All the events of the user</returns>
        public async Task<List<UserData>> Get(string id) =>
            await _usersCollection.Find(x => x.UserId == id).ToListAsync();

        /// <summary>
        /// Gets all the events of the user in which they are added as a connection/moderator.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<List<UserData>> GetConnections(string id)
        {
            var filter = Builders<UserData>.Filter.AnyEq(x => x.Connections, id);
            var filter2 = Builders<UserData>.Filter.AnyEq(x => x.Moderator, id);
            var response = await _usersCollection.Find(filter2).ToListAsync();
            var result = await _usersCollection.Find(filter).ToListAsync();
            result.AddRange(response);
            return result;
        }

        /// <summary>
        /// Gets the particular document/event details with the given _id.
        /// </summary>
        /// <param name="id">Id of the event</param>
        /// <returns>Returns the event details/document</returns>
        public async Task<UserData> GetId(string id) =>
           await _usersCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        /// <summary>
        /// Updates the document/event details by replacing the old document by the new one provided.
        /// </summary>
        /// <param name="updatedUser">This is the document that needs to be updated</param>
        public void Update(UserData updatedUser) =>
           _usersCollection.ReplaceOneAsync(x => x.Id == updatedUser.Id, updatedUser);

        /// <summary>
        /// used for deleting the document with the particular provided id
        /// </summary>
        /// <param name="id">Id of the event/document</param>
        public void Remove(string id) =>
             _usersCollection.DeleteOneAsync(x => x.Id == id);

        /// <summary>
        /// Creates a new document in the database when an event is added.
        /// </summary>
        /// <param name="newUser"></param>
        public void Create(UserData newUser)
        {

            _usersCollection.InsertOneAsync(newUser);


        }
        /// <summary>
        ///This function is used to send the emails after creating/updating/deleting the event.
        ///First it will configure the smtp services. like port number and the server.
        ///Acquiring the the details of the email
        ///Sender Email and password is needed and from the event reciever emails are obtained
        ///sending the email using smtp.
        /// </summary>
        public void SendEmail(EmailData user)
        {
           
            string senderEmail = _configuration["EmailSettings:SenderEmail"] ?? string.Empty; ;
            string smtpServer =_configuration["EmailSettings:SmtpServer"] ?? string.Empty; ;
            int port = int.Parse(_configuration["EmailSettings:Port"] ?? "0");
            string password = _configuration["EmailSettings:Password"] ?? string.Empty;


            var email = new MimeMessage();
            var body = user.Body;
            email.From.Add(MailboxAddress.Parse(senderEmail));
            email.To.Add(MailboxAddress.Parse(user.UserEmail));
            foreach (var moderator in user.Moderator!)
            {
                email.Bcc.Add(MailboxAddress.Parse(moderator));
            }
            foreach (var connection in user.Connections!)
            {
                email.Cc.Add(MailboxAddress.Parse(connection));
            }
            email.Subject = user.Subject;
            email.Body = new TextPart(TextFormat.Text) { Text = body };
            using var Smtp = new SmtpClient();
           
            Smtp.Connect(smtpServer, port, SecureSocketOptions.StartTls);
            Smtp.Authenticate(senderEmail, password);
            Smtp.Send(email);
            Smtp.Disconnect(true);


        }
        /// <summary>
        /// This function is to send the reminders of all the events before 10 mins of the start time of the event. 
        /// The events are filtered from the database according to the start date and reminder variable is false.
        /// After getting all the details required to send the email. This function will call SendEmailAsync();
        /// After calling the function it will replace the document with the updated document where the reminder variable is set treu.
        /// </summary>
        
        public async Task RunReminderTask()
        {
            var currentDateTimeUtc = DateTime.UtcNow;
            var reminderThreshold = currentDateTimeUtc.AddMinutes(10);
            var upcomingEvents = await _usersCollection
                   .Find(e => DateTime.Parse(e.StartDate) >= currentDateTimeUtc && DateTime.Parse(e.StartDate) < reminderThreshold && !e.Reminder)
                   .ToListAsync();

            foreach (var ev in upcomingEvents)
            {
                var timeDifference = DateTime.Parse(ev.StartDate) - currentDateTimeUtc;

                var moderators = new List<string>();
                var connections = new List<string>();
                var details = new EmailData();
                foreach (var connection in ev.Connections)
                {
                    var response = await _connection.Get(connection);
                    if (response != null) { connections.Add(response.EmailId!); }
                }
                foreach (var moderator in ev.Moderator)
                {
                    var response = await _connection.Get(moderator);
                    if (response != null) { moderators.Add(response.EmailId!); }
                }
                var userEmail = await _connection.Get(ev.UserId);
                details.Subject = "Reminder For the Event";
                details.UserEmail = userEmail.EmailId;
              
                details.Body = $"The event named {ev.EventName} will start in 10 minutes.";
                details.StartDate = ev.StartDate;
                details.EndDate = ev.EndDate;
                details.EventName = ev.EventName;
                details.Id = ev.Id;
                
                details.Connections = connections;
                details.Moderator = (moderators);

                SendEmail(details);
                ev.Reminder = true;
                await _usersCollection.ReplaceOneAsync(e => e.Id == ev.Id, ev);


            }
        }


    }
}
