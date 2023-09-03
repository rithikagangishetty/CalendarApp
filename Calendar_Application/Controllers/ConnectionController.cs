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

namespace Calenderwebapp.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class ConnectionController : Controller
    {
       
        private readonly IConnectionSupervisor _connectionSupervisor;
        public ConnectionController(IConnectionSupervisor connectionSupervisor)
        {
            _connectionSupervisor = connectionSupervisor;
        }
        /// <summary>
        /// Takes object Id and returns email Id of the user
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Email Id of the user</returns>
        
        [HttpGet]
        public async Task<ActionResult<ConnectionDetails>> GetUser(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Invalid id parameter.");
            }
            var connection = await _connectionSupervisor.GetEmailId(id);
            if (connection is null)
            {
                return NotFound();
            }

            return connection;
        }

        /// <summary>
        /// All the documents in the database are called
        /// </summary>
        /// <returns>List of all the email Ids</returns>
        [HttpGet]
        public async Task<ActionResult<List<string>>> Get()
        {
            var res = await _connectionSupervisor.Get();
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
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Invalid email parameter.");
            }
            var connection = await _connectionSupervisor.GetId(email);
            if (connection is null)
            {
                return NotFound();
            }

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
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Invalid id parameter.");
            }
            var user=await _connectionSupervisor.GetEmail(id);
            if(user is null)
            {
                return NotFound();
            }
            return user;
        }

        /// <summary>
        /// API call for the new user that needs to be added
        /// </summary>
        /// <param name="user">new user</param>
        [HttpPost]
        public async Task<IActionResult> Post(ConnectionDetails user)
        {
            if (user == null)
            {
                return BadRequest("Invalid user data.");
            }
          var result=  await _connectionSupervisor.Post(user);
            if (result is null)
            {
                return BadRequest("Invalid user data.");
            }

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
            if (user == null)
            {
                return BadRequest("Invalid user data.");
            }
           var res= await  _connectionSupervisor.Update(user);
            if (res is null)
            {
                return BadRequest();
            }
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
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(emailId))
            {
                return BadRequest("Invalid id or emailId parameters.");
            }
            
            var final= await _connectionSupervisor.Delete(emailId,id);
            if (final is null)
            {
                return BadRequest();
            }
        return Ok();
             
        }
    }
}

