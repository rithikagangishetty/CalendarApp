using Main.Models;
using Main.Supervisor;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Serilog;
using System.Threading.Tasks;


namespace Calenderwebapp.Controllers
{


    [ApiController]
    [Route("[controller]/[action]")]
    public class UserController : Controller
    {
       

        private readonly IUserSupervisor _userSupervisor;
        private readonly ILogger<UserController> _logger;
        public UserController(IUserSupervisor userSupervisor, ILogger<UserController> logger)
        {

            _userSupervisor = userSupervisor;
            _logger = logger;
           
          
        }

        /// <summary>
        /// It gets all the events based on the id of the user
        /// </summary>
        /// <param name="id"></param>
        /// <returns>list of the obtained events</returns>
        [HttpGet]
        public async Task<ActionResult<List<UserDetails>>> GetEvents(string id)
        {
            _logger.LogInformation("GetEvents method called with user id: {Id}", id);

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid id parameter: {Id}", id);
                return BadRequest("Invalid id parameter.");
            }

            var result = await _userSupervisor.GetEvents(id);
          
            if (!result.Any() || result==null)
            {
                _logger.LogInformation("No events found for user id: {Id}", id);
                return new List<UserDetails>();
            }


            _logger.LogInformation("Events retrieved successfully for user id: {Id}", id);
            return result;
        }

        /// <summary>
        /// It gets all the events  where id is a part of in the connection Id events and vice versa.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="connectionId"></param>
        /// <returns>List of the events</returns>

        [HttpGet]
        public async Task<ActionResult<List<UserDetails>>> GetView(string id, string connectionId)
        {
            _logger.LogInformation("GetView method called with id: {Id} and connectionId: {ConnectionId}", id, connectionId);
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(connectionId))
            {
                _logger.LogWarning("Invalid id or connectionId parameters. id: {Id}, connectionId: {ConnectionId}", id, connectionId);
                return BadRequest("Invalid id or connectionId parameters.");
            }

            var result = await _userSupervisor.GetView(id, connectionId);
            if (!result.Any())
            {
                _logger.LogInformation("No events found for id: {Id} and connectionId: {ConnectionId}", id, connectionId);
                return new List<UserDetails>();
            }
            _logger.LogInformation("Events retrieved successfully for id: {Id} and connectionId: {ConnectionId}", id, connectionId);
            return result;
        }

        /// <summary>
        /// Gets the document with the event id 
        /// It will change the moderator and connection from objectId to email Ids
        /// </summary>
        /// <param name="id">It is the event id</param>
        /// <returns>The modified event</returns>

        [HttpGet]
        public async Task<ActionResult<UserDetails>> GetEvent(string id)
        {
            _logger.LogInformation("GetEvent method called with event id: {Id}", id);
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid id parameter: {Id}", id);
                return BadRequest("Invalid id parameter.");
            }

            var events = await _userSupervisor.GetEvent(id);
            if (events == null)
            {
                _logger.LogWarning("Event details not found for id: {Id}", id);
                return NotFound();
            }
            _logger.LogInformation("Events retrieved successfully for id: {Id}", id);
            return events;
        }

        /// <summary>
        /// API call for adding a new event.
        /// </summary>
        /// <param name="newUser"></param>
        /// <returns>returns the details of the event</returns>

        [HttpPost]
        public async Task<ActionResult<UserDetails>> Post(UserDetails newUser)
        {
            _logger.LogInformation("Post method is called");
            if (newUser == null)
            {
                _logger.LogWarning("Invalid user data");
                return BadRequest("Invalid user data.");
            }
            // Check if the StartDate is greater than the EndDate
            if (DateTime.Parse(newUser.StartDate) >= DateTime.Parse(newUser.EndDate))
            {
                _logger.LogWarning("Invalid End Date/Time of the event");
                return BadRequest("Invalid End Date/Time of the event");
            }

            var id = await _userSupervisor.Post(newUser);
            if(id == null) {
                _logger.LogWarning("Failed to add the data of the event"); 
                return BadRequest(); }
            _logger.LogInformation("Added new data successfully");
            return id;
        }

        /// <summary>
        /// This will send emails after edit/create/delete is done.
        /// </summary>
        /// <param name="emailDetails"></param>
        /// <returns>if mail is not sent properly bad Request or else ok();</returns>
        [HttpPost]
        public async Task<ActionResult> SendMail(EmailDetails emailDetails)
        {
            _logger.LogInformation("SendMail method called");
            if (emailDetails == null)
            {
                _logger.LogWarning("Details of the event email is invalid");
                return BadRequest("Invalid email data.");
            }

           var details= await _userSupervisor.SendMail(emailDetails);
            if(details == null) {
                _logger.LogWarning("Failed to send email"); return BadRequest(); }
            _logger.LogInformation("Successfully sent the email");
            return Ok();
        }

        /// <summary>
        /// API call to update the existing document/event.
        /// </summary>
        /// <param name="newUser"></param>
        /// <returns>returns the details of the event</returns>

        [HttpPut]
        public async Task<ActionResult<UserDetails>> Update(UserDetails newUser)
        {
            _logger.LogInformation("Update method for event details called.");
            if (newUser == null)
            {
                _logger.LogWarning("Invalid user data received.");
                return BadRequest("Invalid user data.");
            }
            if (DateTime.Parse(newUser.StartDate) >= DateTime.Parse(newUser.EndDate))
            {
                return BadRequest("Invalid End Date/Time of the event");
            }
            var user = await _userSupervisor.Update(newUser);
          if(user == null) { return BadRequest(); } 
           

            return user;
        }

        /// <summary>
        /// This deletes the existing event if the user is moderator/creator or else just removes the user as part of the event.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="userId"></param>
        /// <returns>returns the details of the event</returns>
        [HttpDelete]
        public  ActionResult<UserDetails> Delete(string id, string userId)
        {
            _logger.LogInformation("Delete method for event details called.");
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Invalid id or userId received.");
                return BadRequest("Invalid id or userId parameters.");
            }

            var user =  _userSupervisor.Delete(id, userId);
            if (user == null)
            {
                _logger.LogError("Failed to delete the event data.");
                return NotFound();
            }
            _logger.LogInformation("Event data deleted successfully.");

            return user;
        }
    }
}

 


