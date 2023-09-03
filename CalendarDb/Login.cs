using MongoDB.Driver;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Main.Models;
using Main.Repository;
using Microsoft.Extensions.Configuration;

namespace CalendarDb
{
    public class Login : ILogin
    {

        private readonly IMongoCollection<ConnectionData> _loginCollection;
        private readonly IConfiguration _configuration;
        //setting up the connection with database
        public Login(IConfiguration configuration)
        {
            _configuration = configuration;
            var mongoClient = new MongoClient(
                  _configuration["ConnectionDb:ConnectionString"]);

            var mongoDatabase = mongoClient.GetDatabase(
                _configuration["ConnectionDb:DatabaseName"]);

            _loginCollection = mongoDatabase.GetCollection<ConnectionData>(
                 _configuration["ConnectionDb:UsersCollectionName"]);

        }
        /// <summary>
        /// Finds the first document with the given EmailId. If it is present in the database
        /// </summary>
        /// <param name="EmailId"></param>
        /// <returns>It returns the document</returns>

        public ConnectionData login(string emailId)
        {
            var filter = Builders<ConnectionData>.Filter.Eq(u => u.EmailId, emailId);
            var user = _loginCollection.Find(filter).FirstOrDefault();
            return user;
        }

        /// <summary>
        /// Creates a document with the given EmailId. a new user will be registered
        /// </summary>
        /// <param name="EmailId"></param>
        /// <returns>It returns the document</returns>

        public ConnectionData signup(ConnectionData emailId)
        {

            _loginCollection.InsertOne(emailId);
            return emailId;
        }
    }
}
