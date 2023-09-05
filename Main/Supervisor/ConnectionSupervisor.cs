using CalendarDb;
using Main.Models;
using Main.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Main.Supervisor
{
    public class ConnectionSupervisor : IConnectionSupervisor
    {
        private readonly IConnection _connection;
        private readonly ILogger<IConnectionSupervisor> _logger;
        public ConnectionSupervisor(IConnection connection, ILogger<IConnectionSupervisor> logger)
        {
            _logger= logger;
            _connection = connection;
        }
        /// <summary>
        /// This function obtains the document from the database based on the email Id provided.
        /// </summary>
        /// <param name="email">email Id of the user</param>
        /// <returns>The user document</returns>
        public async Task<ConnectionDetails?> GetId(string email)
        {
            _logger.LogInformation("GetId method in supervisor is called with email: {EmailId}", email);

            if (email == null)
            {
                _logger.LogWarning("Email is null");
                return null;
            }
            var user = await _connection.GetId(email);
           
            if (user is null)
            {
                _logger.LogWarning("User is null");
                return null;
            }
            var result = new ConnectionDetails(user);
            _logger.LogInformation("User found for email: {EmailId}", email);
            return result;
        }

        /// <summary>
        /// All the documents in the database are called
        /// </summary>
        /// <returns>List of all the email Ids</returns>
        public async Task<List<string>> Get()
        {
            _logger.LogInformation("Get method in supervisor is called");

            var res = await _connection.GetAll();
            if (res == null) {
                _logger.LogInformation("No Emails are found in the database");
                
                return new List<string>(); }
            var result = new List<string>();
            
                foreach (var x in res)
                {
                        result.Add(x.EmailId);
                        
                    
                }
            _logger.LogInformation("Get method successful.");
            return result;
        }

        /// <summary>
        /// This function obtains the document from the database based on the user Id provided.
        /// </summary>

        /// <param name="id">user id </param>
        /// <returns>The user document</returns>
        public async Task<ConnectionDetails?> GetEmailId(string id)
        {
            _logger.LogInformation("GetEmailId (supervisor) method is called with id: {Id}", id);
            if (id == null)
            {
                _logger.LogWarning("User Id is null");
                return null;
            }
            var result = await _connection.Get(id);
            if(result == null) {
                _logger.LogWarning("User not found");
                return null; }
            var connection = new ConnectionDetails(result);

            _logger.LogInformation("User found");
            return connection;
        }

        /// <summary>
        /// This function takes the id of the user and converts the connections from objectid to emailId 
        /// which is further used for displaying in user connections page
        /// </summary>
        /// <param name="id">user id</param>
        /// <returns>Same document but the connections array with emailIds</returns>
        public async Task<ConnectionDetails?> GetEmail(string id)
        {
            _logger.LogInformation("GetEmail method in supervisor is called with id: {Id}", id);
            if (id == null)
            {
                _logger.LogWarning("Id is null");
                return null;
            }
            var connections = await _connection.Get(id);
            if(connections == null) {
                _logger.LogWarning("User not found");
                return null; }

            
            var newUser = new ConnectionDetails
            {
                Id = id
            };
           
        var newConnections = connections.Connection.Select(async connection =>
        {
        var user = await _connection.Get(connection);
            return user;
            }).Where(task => task.Result != null).Select(task => task.Result.EmailId).ToList();


            newUser.EmailId = connections.EmailId;
            newUser.Connection = newConnections;
            _logger.LogInformation("GetEmail method is succesfully executed");

            return newUser;
        }

        /// <summary>
        /// New user will be added
        /// </summary>
        /// <param name="user">new user</param>

        public async Task<ConnectionDetails?> Post(ConnectionDetails user)
        {
            _logger.LogInformation("Post Method is called");
            if (user == null)
            {
                _logger.LogWarning("User is null ");
                return null;
                
            }
            var userData = new ConnectionData(user);
            await _connection.Create(userData);
            _logger.LogInformation("Post Method is executed");
            return user;

        }

        /// <summary>
        /// The existing user "A" added "B" as a connection
        /// This function adds B as a connection in document A
        /// And also A as a connection in document B.
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<ConnectionDetails?> Update(ConnectionDetails user)
        {
            _logger.LogInformation("Update method for connection called.");

            if (user == null)
            {
                _logger.LogWarning("user data is null.");
                return null;
            }
            var lastConnection = user.Connection.LastOrDefault();
                    if(lastConnection == null) { return null; };
                        var response = await _connection.GetId(lastConnection);
                        if(response == null) { return null; }
                        var connection = user.Connection.Take(user.Connection.Count - 1).ToList();
                        var connect = response.Connection.ToList() ?? new List<string>();
                                connect.Add(user.Id);
                                connection.Add(response.Id);
                        var userData = new ConnectionData(user);
                        var final = new ConnectionDetails(userData);
                        await _connection.Update(userData, connection);
                        if (response != null)
                        {
                            await _connection.Update(response, connect);
                        }
            _logger.LogInformation("User data updated successfully.");
            return final;
                    
                
            
           
        }

        /// <summary>
        /// It deletes the selected connection in the user document
        /// </summary>
        /// <param name="emailId">The emailId of the connection user wants to remove</param>
        /// <param name="id">Object id of the user document</param>
        /// <returns></returns>
        public async Task<string?> Delete(string emailId, string id)
        {
            _logger.LogInformation("Delete method for connection called.");

            if (emailId == null || id == null)
            {
                _logger.LogWarning("id or emailId received are null.");
                return null;
               
            }

            var user = await _connection.Get(id);
           
            var connection = await _connection.GetId(emailId);
            if (user is null || connection is null) 
            {
                _logger.LogError("user or connection is null, could not delete the data");
                return null; 
            }
           
               user.Connection.Remove(connection.Id); 
                
            
               connection.Connection.Remove(user.Id);
            await _connection.Update(user, user.Connection);
            await _connection.Update(connection, connection.Connection);
            _logger.LogInformation("User data deleted successfully.");
            return user.Id;

        }
    }
}
