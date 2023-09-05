using CalendarDb;
using System.Text;
using Main.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Main.Repository;
using Microsoft.AspNetCore.Mvc.Diagnostics;

namespace Main.Supervisor
{
    public class UserSupervisor : IUserSupervisor
    {
        private readonly IUser _users;
        private readonly IConnection _connections;
        private readonly ILogger<IUserSupervisor> _logger;
        public UserSupervisor(IUser Users, IConnection connections, ILogger<IUserSupervisor> logger)
        {
            _users = Users;
            _connections = connections;
            _logger = logger;


        }
        /// <summary>
        /// Gets all the events of the specific user with the help of UserId.
        /// </summary>
        /// <param name="id">UserId</param>
        /// <returns></returns>
        public async Task<List<UserDetails>?> GetEvents(string id)
        {
            _logger.LogInformation("GetEvents in supervisor is called");
            if (id == null)
            {
                _logger.LogWarning("User Id is null : {Id}",id);

                return null;
            }

            var users = await _users.Get(id);
            var events = await _users.GetConnections(id);
            var allData = (users ?? Enumerable.Empty<UserData>()).Concat(events ?? Enumerable.Empty<UserData>());
            if (allData == null) {
                return new List<UserDetails>(); }
            var result = allData.Select(data => new UserDetails(data)).ToList();
            _logger.LogInformation("All the Events with userId : {} are retrived",id);
            return result ;
        }

        /// <summary>
        /// This function is to get the events for the connections calendar
        /// Gets all the events where the user is added in the selected connection events.
        /// </summary>
        /// <param name="id">This is the userId</param>
        /// <param name="connectionId">This is the Id of the connection user wants to view</param>
        /// <returns>It returns the list of events</returns>
        public async Task<List<UserDetails>?> GetView(string id, string connectionId)
        {
            _logger.LogInformation("GetView method called with id: {Id} and connectionId: {ConnectionId}", id, connectionId);
               if (id == null||connectionId==null)
            {
                _logger.LogWarning("id or connectionId parameters are null");

                return null;
            }
            
            var users = await _users.Get(id);
            var response = await _users.Get(connectionId);
            var final = await _users.GetConnections(id);

            var combinedUsers = final
        .Union(users)
        .Union(response)
        .Where(user =>
            user.Moderator.Contains(connectionId) ||
            user.Connections.Contains(connectionId) || (user.UserId == connectionId &&
         (user.Moderator.Contains(id) || user.Connections.Contains(id)))
        ).GroupBy(user => user.Id)  // Group users by their Id
    .Select(group => group.First())  // Select the first user from each group
    .ToHashSet();


            var result = combinedUsers.Select(userData => new UserDetails(userData)).ToList();
            _logger.LogInformation("Events retrieved successfully for id: {Id} and connectionId: {ConnectionId}", id, connectionId);
            return result.ToList();
        }

        /// <summary>
        /// Gets the document with the event id 
        /// It will change the moderator and connection from objectId to email Ids
        /// </summary>
        /// <param name="id">It is the event id</param>
        /// <returns>The modified event</returns>

        public async Task<UserDetails?> GetEvent(string id)
        {
            _logger.LogInformation("GetEvent method called in supervisor with event id: {Id}", id);
            if (id == null)
            {
                _logger.LogWarning("id is null");
                return null;
            }
            var events = await _users.GetId(id);
           
            var UserId = await _connections.Get(events.UserId);
            if(UserId is null)
            {
                _logger.LogWarning("Invalid UserId parameter: {Id}", UserId);
                return null; }
            if (UserId.EmailId != null)
            {
                events.UserId = UserId.EmailId;
            }
            var moderatorTasks = events.Moderator.Select(moderator => _connections.Get(moderator));
            var connectionTasks = events.Connections.Select(connect => _connections.Get(connect));

           var moderators = (await Task.WhenAll(moderatorTasks)).Where(user => user != null).Select(user => user.EmailId).ToList();

            var connections = (await Task.WhenAll(connectionTasks)).Where(user => user != null).Select(user => user.EmailId).ToList();


            events.Connections.Clear();
          events.Connections.AddRange(connections!); 
            events.Moderator.Clear();
            events.Moderator.AddRange(moderators!);
            var userDetailsEvent = new UserDetails(events);
            _logger.LogInformation("Events retrieved successfully for id: {Id}", id);
            return userDetailsEvent;
          
        }

        /// <summary>
        /// Lock object created to use in Post/Update/Delete functions
        /// </summary>
        private static readonly object createEventLock = new object();


        /// <summary>
        /// Only one thread can enter the post function at any given time. This is done to avoid concurrent event creation.
        /// This Post function is to save the new events created by the user.
        /// Before adding the details to the database the function filters out moderators and connections to check no event overlaps
        /// </summary>
        /// <param name="newUser"></param>
        /// <returns></returns>

        public async Task<UserDetails?> Post(UserDetails newUser)
        {
            _logger.LogInformation("Post method is called in supervisor");
            UserDetails user;
            UserDetails finalUser;
            UserDetails userCopy;
           
            if (newUser == null)
            {
                _logger.LogWarning("user data is null");
                return null;
            }
            
            lock (createEventLock)
            {

                var userEvents = _users.Get(newUser.UserId).GetAwaiter().GetResult();
                var events = _users.GetConnections(newUser.UserId).GetAwaiter().GetResult();
                var allEventData = events.Concat(userEvents).ToList();
                var allEvents = allEventData.Select(userData => new UserDetails(userData)).ToList();
                
                bool hasEventClash = allEvents.Any(j => CheckOverlap(newUser, j));
                if (hasEventClash)
                {
                    _logger.LogInformation("There is an event clash, so this event is not created");
                    var copy = new UserDetails(newUser);
                    copy.Id = "eventclash";
                    return copy;
                }
                else
                {
                    user = Filtering(newUser).GetAwaiter().GetResult();
                    userCopy = new UserDetails(user);
                    var userData = new UserData(user);
                   finalUser = Overlap(user).GetAwaiter().GetResult();
                    if(userCopy.Moderator.Count==finalUser.Moderator.Count&& userCopy.Connections.Count==finalUser.Connections.Count)
                    
                    {
                        _logger.LogInformation("Event created successfully");
                        _users.Create(userData);
                        return user;
                    }
                }

            }
            var final = await CheckConnections(userCopy, finalUser);
            _logger.LogInformation("Some of the moderators/connections are not available, so the event is not created");
            return final;
            
        }

        /// <summary>
        /// This function sends mail after any event is created/edited/deleted.
        /// In the case of deleting the event the moderators and connections array will be having ObjectIds
        /// So it is first changed into email Ids and email will be sent.
        /// </summary>
        /// <param name="id">Email Details</param>
        /// <returns>event email details</returns>
        public async Task<EmailDetails?> SendMail(EmailDetails id)
        {
            _logger.LogInformation("SendMail method called");
            if (id == null)
            {
                _logger.LogWarning("Details of the event email is null");
                
                return null;
            }            
                var userEmail = await _connections.Get(id.UserEmail);
                id.UserEmail = userEmail.EmailId;

            if (!id.priv || id.Delete)
            {
                var connections = new List<string>();
                
                foreach (var connection in id.Connections)
                {
                    var response = await _connections.Get(connection);
                    if (response != null && !id.Moderator.Contains(response.EmailId))
                    {

                        connections.Add(response.EmailId);
                    }

                }
                if (id.Delete)
                {
                    var moderators = new List<string>();
                   
                        foreach (var moderator in id.Moderator)
                        {
                            var response = await _connections.Get(moderator);
                            if (response != null && response.EmailId != null)
                            {
                                moderators.Add(response.EmailId);
                            }
                        }
                    id.Moderator.Clear();
                    id.Moderator.AddRange(moderators);
                }
                id.Connections.Clear();
                id.Connections.AddRange(connections);
            }
            var Id = new EmailData(id);
            _users.SendEmail(Id);
            _logger.LogInformation("Successfully sent the email");
            return id;

        }

        /// <summary>
        /// It updates the old document with the new one user provided based on the event id
        /// Only one thread can enter the update function at any given time. This is done to avoid concurrent event creation.
        /// Before adding the details to the database the function filters out moderators and connections to check no event overlaps
        /// </summary>
        /// <param name="updatedUser">updated details of the event</param>
        /// <returns>updated document</returns>
        public async Task<UserDetails?> Update(UserDetails updatedUser)
        {
            _logger.LogInformation("Update method in supervisor for event details called.");
            UserDetails user;
            UserDetails finalUser;
            UserDetails userCopy;
            if (updatedUser == null)
            {
                _logger.LogWarning("Invalid user data received.");
                return null;
            }
            lock (createEventLock)
            {
                var userEvents = _users.Get(updatedUser.UserId).GetAwaiter().GetResult();
                var events = _users.GetConnections(updatedUser.UserId).GetAwaiter().GetResult();
                var allData = events.Concat(userEvents).ToList();
                var allEvents = allData.Select(data => new UserDetails(data)).ToList();
                allEvents.RemoveAll(userDetail => userDetail.Id == updatedUser.Id);
                bool hasEventClash = allEvents.Any(j => CheckOverlap(updatedUser, j));
                if (hasEventClash)
                {
                    var copy = new UserDetails(updatedUser);
                    copy.Id = "eventclash";
                    _logger.LogInformation("There is an event clash, so this event cant be edited");
                    return copy;
                }
                else
                {
                    user = Filtering(updatedUser).GetAwaiter().GetResult();
                    var userData = new UserData(user);
                    userCopy = new UserDetails(user);
                    finalUser = Overlap(user).GetAwaiter().GetResult();
                    if (userCopy.Moderator.Count == finalUser.Moderator.Count && userCopy.Connections.Count == finalUser.Connections.Count)
                    {
                        _users.Update(userData);
                        _logger.LogInformation("Event Edited successfully");
                        return user;
                    }
                }
             
            }
            var final = await CheckConnections(userCopy, finalUser);
            _logger.LogInformation("Some of the moderators/connections are not available, so the event cant be edited");
            return final;

        }

        /// <summary>
        /// This function checks the user who wants to delete the function is moderator/creator or connection
        /// If connection only the user gets deleted from the event.
        /// Else the whole document/event gets deleted.
        ///Only one thread can enter the update function at any given time. This is done to avoid concurrent event creation.
        /// </summary>
        /// <param name="id">Event Id</param>
        /// <param name="userId">User Id</param>
        /// <returns></returns>
        public  UserDetails? Delete(string id, string userId)
        {
            _logger.LogInformation("Delete method for event details called.");
            if (id == null||userId==null)
            {
                _logger.LogWarning("Invalid id or userId received.");
                return null;
            }
            lock (createEventLock)
            {
                var user = _users.GetId(id).GetAwaiter().GetResult();
                var userDetails = new UserDetails(user);
                if (user.UserId == userId || user.Moderator.Contains(userId))
                {
                    _users.Remove(id);

                }
                else
                {
                    user.Connections.Remove(userId);
                    user.Moderator.Remove(userId);
                    _users.Update(user);

                }
                _logger.LogInformation("Event data deleted successfully.");
                return userDetails;
            }


        }

        //public async Task SimulateConcurrentRequests()
        //{
        //    int numRequests = 2; // Number of concurrent requests to simulate

        //   var tasks = new List<Task<UserDetails>>();
        //    // List<Task<UserDetails>> tasks = new List<Task<UserDetails>>();

        //    for (int i = 0; i < numRequests; i++)
        //    {
        //        var newUser = new UserDetails(); // Create a new user details object for each request

        //        DateTime localTime = DateTime.Now;
        //        DateTime utcTime = localTime.ToUniversalTime();
        //        var mod1 = new List<string> { "sathvika@gmail.com" };
        //        var mod2 = new List<string> { "rithika@gmail.com" };
        //        var con = new List<string> { "dummy@gmail.com" };


        //        if (i % 2 == 0)
        //        {
        //            newUser.StartDate = utcTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        //            newUser.EndDate = utcTime.AddMinutes(30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        //            newUser.UserId = "6491d4bd145fb8901b10e56e"; //sathvika
        //                                                         // newUser._id = "64aba838b401cc143facefb3";
        //            newUser.EventName = "lock_1";
        //            newUser.Moderator = mod2;
        //            newUser.Connections = con;
        //            newUser.priv = true;
        //        }
        //        else
        //        {
        //            newUser.StartDate = utcTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        //            newUser.EndDate = utcTime.AddMinutes(30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        //            newUser.UserId = "6491d489145fb8901b10e56d"; 
        //            newUser.EventName = "lock_2";
                   
        //            newUser.Moderator = mod1;
        //            newUser.Connections = con;
        //            newUser.priv = true;
        //        }
        //        Task<UserDetails> task = Task.Run(async () => await Post(newUser)); 
                
        //        tasks.Add(task);
        //    }
        //    await Task.WhenAll(tasks);


        //}

        /// <summary>
        /// Changes the emailIds to object Ids
        /// </summary>
        /// <param name="newUser">Event details</param>
        /// <returns>updated event document</returns>
        public async Task<UserDetails> Filtering(UserDetails newUser)
        {
            _logger.LogInformation("Filtering method is called");
            var res = await Task.WhenAll(newUser.Moderator.Select(async email =>
            {
                var connection = await _connections.GetId(email);
                return connection != null ? connection.Id : null;
            }));
            newUser.Moderator = res.Where(id => id != null).ToList()!;
            newUser.Moderator = newUser.Moderator.Where(mod => mod != newUser.UserId).ToList();
            if (newUser.priv)
            {
                var connect = await Task.WhenAll(newUser.Connections.Select(async email =>
                {
                    var connection = await _connections.GetId(email);
                    return connection != null ? connection.Id : null;
                }));

                newUser.Connections = connect.Where(id => id != null).ToList()!;
            }

            HashSet<string> moderators = new HashSet<string>(newUser.Moderator);
            newUser.Connections = newUser.Connections.Where(str => !moderators.Contains(str)).ToList();
            _logger.LogInformation("Filtering method is executed successfully");
            return newUser;
        }

        /// <summary>
        /// Used to filter out the moderators and connections before adding them to database
        /// If the current event that they have been added overlaps with their existing ones , those moderators/connections will be removed 
        /// </summary>
        /// <param name="newUser">Event details</param>
        /// <returns>updated event document</returns>
        public async Task<UserDetails> Overlap (UserDetails newUser)
        {
            _logger.LogInformation("Overlap method is called");
            var users = new List<string>();
            var moderator = new List<string>();
            for (int i = 0; i < newUser.Connections.Count + newUser.Moderator.Count; i = i + 1)
            {
                var user = i < newUser.Connections.Count ? newUser.Connections[i] : newUser.Moderator[i - newUser.Connections.Count];
                var result = await _users.Get(user);
                var calendarevent = await _users.GetConnections(user);
                var allData = calendarevent.Concat(result).ToList();
                var events = allData.Select(data => new UserDetails(data)).ToList();
                var userToRemove = events.FirstOrDefault(u => u.Id == newUser.Id);
                if (userToRemove != null)
                {
                    events.Remove(userToRemove); // Remove the user from the events list
                }
                if (!events.Any())
                {
                    (i < newUser.Connections.Count ? users : moderator).Add(user);
                }
                else if (events.Count(j => CheckOverlap(newUser, j)) == 0)
                {
                    (i < newUser.Connections.Count ? users : moderator).Add(user);
                }

            }
            newUser.Connections.Clear();
            newUser.Moderator.Clear();
            newUser.Moderator.AddRange(moderator);
            newUser.Connections.AddRange(users);
            _logger.LogInformation("Overlap method is executed successfully");
            return newUser;
        }

        /// <summary>
        /// This function checks whether the start and end time of the newUser and existingUser is overlapping
        /// if yes, it will return true else false.
        /// </summary>
        /// <param name="newUser">The new Event document</param>
        /// <param name="existingUser">The existing event document</param>
        /// <returns>if overlap true, else false</returns>
        public bool CheckOverlap(UserDetails newUser, UserDetails existingUser)
        {
            _logger.LogInformation("CheckOverlap method is called");
            var startDateNew = DateTime.Parse(newUser.StartDate);
            var endDateNew = DateTime.Parse(newUser.EndDate);
            var startDateExisting = DateTime.Parse(existingUser.StartDate);
            var endDateExisting = DateTime.Parse(existingUser.EndDate);
            _logger.LogInformation("CheckOverlap method is finished successfully");
            return (startDateNew >= startDateExisting && startDateNew < endDateExisting) ||
                   (endDateNew > startDateExisting && endDateNew <= endDateExisting) ||
                   (startDateNew <= startDateExisting && endDateNew >= endDateExisting);
        }

        /// <summary>
        /// It gives the objectId of the connections and moderators in the event added are not available at the start and end time of the newUser event time
        /// </summary>
        /// <param name="newUser">The original event with all moderators and connections</param>
        /// <param name="user">the updated event with available moderators and connections</param>
        /// <returns>It returns the event details with connections and moderators which are not available</returns>

        public async Task<UserDetails> CheckConnections(UserDetails newUser, UserDetails user)
        {
            _logger.LogInformation("CheckConnections method is called");
            var newUserModerators = new HashSet<string>(newUser.Moderator);
            var newUserConnections = new HashSet<string>(newUser.Connections);

            // Remove moderators and connections that are common to both newUser and user
            newUserModerators.ExceptWith(user.Moderator);
            newUserConnections.ExceptWith(user.Connections);

            // Fetch the emailIds for the remaining moderators and connections
            var moderatorEmailIds = await Task.WhenAll(newUserModerators.Select(async id =>
            {
                var connection = await _connections.Get(id);
                return connection != null ? connection.EmailId : null;
            }));

            var connectionEmailIds = await Task.WhenAll(newUserConnections.Select(async id =>
            {
                var connection = await _connections.Get(id);
                return connection != null ? connection.EmailId : null;
            }));


            // Create a new UserDetails object to hold the unique moderators and connections
            var finalUser = newUser;
            finalUser.Moderator.Clear();
          
            finalUser.Connections.Clear();
            finalUser.Connections.AddRange(connectionEmailIds.Where(emailId => emailId != null)!);
            finalUser.Moderator.AddRange(moderatorEmailIds.Where(emailId => emailId != null)!);
            finalUser.Id = (user.Moderator.Count == 0 && user.Connections.Count == 0) ? "noevent" : "someevent";


            _logger.LogInformation("CheckConnections method is finished successfully");
            return finalUser;
        }




    }
}
