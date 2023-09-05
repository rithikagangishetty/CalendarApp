using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System;
using Main.Supervisor;
using Main.Models;
using CalendarDb;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using MongoDB.Driver;
using Microsoft.Extensions.Logging;
using System.Web.Helpers;

namespace Calenderwebapp.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class ConnectionController : Controller
    {
       
        private readonly IConnectionSupervisor _connectionSupervisor;
        private readonly ILogger<ConnectionController> _logger;
        public ConnectionController(IConnectionSupervisor connectionSupervisor, ILogger<ConnectionController> logger)
        {
            _connectionSupervisor = connectionSupervisor;
            _logger = logger;
        }
        /// <summary>
        /// Takes object Id and returns email Id of the user
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Email Id of the user</returns>
        
        [HttpGet]
        public async Task<ActionResult<ConnectionDetails>> GetUser(string id)
        {
            _logger.LogInformation("GetUser method is called with id: {Id}", id);
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid id parameter: {Id}", id);
                return BadRequest("Invalid id parameter.");
            }
            var connection = await _connectionSupervisor.GetEmailId(id);
            if (connection is null)
            {
                _logger.LogInformation("User with id {Id} not found.", id);
                return NotFound();
            }

            _logger.LogInformation("User with id {Id} found.", id);
            return connection;
        }

        /// <summary>
        /// All the documents in the database are called
        /// </summary>
        /// <returns>List of all the email Ids</returns>
        [HttpGet]
        public async Task<ActionResult<List<string>>> Get()
        {
            _logger.LogInformation("Get method is called");

            var res = await _connectionSupervisor.Get();
            _logger.LogInformation("Get method executed successfully");
            return res;
        }

        /// <summary>
        /// This function obtains the document from the database based on the email Id provided.
        /// </summary>
        /// <param name="email">email Id of the user</param>
        /// <returns>The user document</returns>
        [HttpGet]
        public async Task<ActionResult<ConnectionDetails>> GetId(string email)
        {
            _logger.LogInformation("GetId method is called with email: {EmailId}", email);

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Invalid email parameter: {EmailId}", email);
                return BadRequest("Invalid email parameter.");
            }
            var connection = await _connectionSupervisor.GetId(email);
            if (connection is null)
            {
                _logger.LogInformation("User not found for the given email: {EmailId}", email);
                return NotFound();
            }
            _logger.LogInformation("User found for email: {EmailId}", email);
            return connection;
        }

        /// <summary>
        /// This function takes the id of the user and converts the connections from objectid to emailId 
        /// which is further used for displaying in user connections page
        /// </summary>
        /// <param name="id">user id</param>
        /// <returns>Same document but the connections array with emailIds</returns>

        [HttpGet]
       
        public async Task<ActionResult<ConnectionDetails>> GetEmail(string id)
        {
            _logger.LogInformation("GetEmail method is called with id: {Id}", id);
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid id parameter: {Id}", id);
                return BadRequest("Invalid id parameter.");
            }
            var user=await _connectionSupervisor.GetEmail(id);
            if(user is null)
            {
                _logger.LogWarning("User not found");

                return NotFound();
            }
            _logger.LogInformation("GetEmail method is succesfully executed");
            return user;
        }

        /// <summary>
        /// API call for the new user that needs to be added
        /// </summary>
        /// <param name="user">new user</param>
        [HttpPost]
        public async Task<IActionResult> Post(ConnectionDetails user)
        {
            _logger.LogInformation("Post Method is called");
            if (user == null)
            {
                _logger.LogWarning("Invalid user data");
                return BadRequest("Invalid user data.");
            }
          var result=  await _connectionSupervisor.Post(user);
            if (result is null)
            {
                _logger.LogWarning("User not added ");
                return BadRequest("Post method is unsuccessful");
            }
            _logger.LogInformation("Post Method is executed");
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
          
        }

        [HttpPut]
        /// <summary>
       ///Updates the user's connections
        /// </summary>
        /// <param name="user"></param>
        /// <returns>if the update is succesfully done then ok else a badRequest will be sent</returns>
        public async Task<IActionResult> Update(ConnectionDetails user)
        {
            _logger.LogInformation("Update method for connection called.");
            if (user == null)
            {
                _logger.LogWarning("Invalid user data received.");
                return BadRequest("Invalid user data.");
            }
           var res= await  _connectionSupervisor.Update(user);
            if (res is null)
            {
                _logger.LogError("Failed to update user data.");
                return BadRequest("Failed to update user data.");
            }
            _logger.LogInformation("User data updated successfully.");
            return Ok();
            
        }
        /// <summary>
        /// It deletes the selected connection in the user document
        /// </summary>
        /// <param name="emailId">The emailId of the connection user wants to remove</param>
        /// <param name="id">Object id of the user document</param>
        /// <returns>if the delete is succesfully done then ok else a badRequest will be sent</returns>
        [HttpDelete]
       
        public async Task<IActionResult> Delete(string emailId, string id)
        {
            _logger.LogInformation("Delete method for connection called.");
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(emailId))
            {
                _logger.LogWarning("Invalid id or emailId received.");
                return BadRequest("Invalid id or emailId parameters.");
            }
            
            var final= await _connectionSupervisor.Delete(emailId,id);
            if (final is null)
            {
                _logger.LogError("Failed to delete the user data.");
                return BadRequest();
            }
            _logger.LogInformation("User data deleted successfully.");
            return Ok();
             
        }
    }
}

