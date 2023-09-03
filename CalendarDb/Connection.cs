using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Main.Repository;
using Main.Models;
using Microsoft.Extensions.Configuration;


namespace CalendarDb
{
    public class Connection :IConnection
    {
       
        private IConfiguration _configuration;
        private readonly IMongoCollection<ConnectionData> _connectionCollection;
        //setting up the connection with database
        public Connection(IConfiguration configuration)
        {
            _configuration = configuration;
            var mongoClient = new MongoClient(
                  _configuration["ConnectionDb:ConnectionString"]);

            var mongoDatabase = mongoClient.GetDatabase(
                _configuration["ConnectionDb:DatabaseName"]);

            _connectionCollection = mongoDatabase.GetCollection<ConnectionData>(
                 _configuration["ConnectionDb:UsersCollectionName"]);
        }

        /// <summary>
        /// Gets the first  document with the given document _id.
        /// </summary>
        /// <param name="id">id of the user</param>
        /// <returns>It returns document with the given id</returns>
        
        public async Task<ConnectionData> Get(string id) =>
               await _connectionCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        /// <summary>
        /// Gets all the documents
        /// </summary>
        /// 
        /// <returns>It returns all the documents</returns>
        
        public async Task<List<ConnectionData>> GetAll()
        {
           var res= await _connectionCollection.Find(_ => true).ToListAsync();
            return res;
        }

        /// <summary>
        /// Gets the particular document with the given document EmailId.
        /// </summary>
        /// <param name="emailId">EmailId of the user</param>
        /// <returns>It returns document with the given EmailId</returns>
        public async Task<ConnectionData> GetId(string emailId) =>
           await _connectionCollection.Find(x => x.EmailId == emailId).FirstOrDefaultAsync();

       /// <summary>
       /// Adds a new document to the database here new User will be added
       /// </summary>
       /// <param name="newUser">new document</param>
       /// <returns></returns>
       
        public async Task Create(ConnectionData newUser) =>
                await _connectionCollection.InsertOneAsync(newUser);

        /// <summary>
        /// Updates the Connections of the user.
        /// </summary>
        /// <param name="connection">This contains the previous data of the document</param>
        /// <param name="newUser">This variable is updated and needs to changed </param>

        public async Task Update(ConnectionData connection, List<string> newUser)
        {
            var filter = Builders<ConnectionData>.Filter.Eq(u => u.Id, connection.Id);

            var user = new ConnectionData();

            user.Id = connection.Id;
            user.EmailId = connection.EmailId;
            user.Connection = newUser;
            await _connectionCollection.ReplaceOneAsync(filter, user);


        }

        /// <summary>
        /// used for deleting the connection with the particular provided id
        /// </summary>
        /// <param name="id">This is the userId</param>
        
        public async Task Remove(string id) =>
                await _connectionCollection.DeleteOneAsync(x => x.Id == id);
    
}
}