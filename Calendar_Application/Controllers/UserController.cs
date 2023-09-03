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
        public UserController(IUserSupervisor userSupervisor)
        {

            _userSupervisor = userSupervisor;
           
           // _userSupervisor.SimulateConcurrentRequests().Wait();
        }

        /// <summary>
        /// It gets all the events based on the id of the user
        /// </summary>
        /// <param name="id"></param>
        /// <returns>list of the obtained events</returns>
        [HttpGet]
        public async Task<ActionResult<List<UserDetails>>> GetEvents(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Invalid id parameter.");
            }

            var result = await _userSupervisor.GetEvents(id);
          
            if (!result.Any() || result==null)
            {
               
                return new List<UserDetails>();
            }

            

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
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(connectionId))
            {
                return BadRequest("Invalid id or connectionId parameters.");
            }

            var result = await _userSupervisor.GetView(id, connectionId);
            if (!result.Any())
            {

                return new List<UserDetails>();
            }

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
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Invalid id parameter.");
            }

            var events = await _userSupervisor.GetEvent(id);
            if (events == null)
            {
                return NotFound();
            }

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
            if (newUser == null)
            {
                return BadRequest("Invalid user data.");
            }
            // Check if the StartDate is greater than the EndDate
            if (DateTime.Parse(newUser.StartDate) >= DateTime.Parse(newUser.EndDate))
            {
                return BadRequest("Invalid End Date/Time of the event");
            }

            var id = await _userSupervisor.Post(newUser);
            if(id == null) { return BadRequest(); }

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
            if (emailDetails == null)
            {
                return BadRequest("Invalid email data.");
            }

           var details= await _userSupervisor.SendMail(emailDetails);
            if(details == null) { return BadRequest(); }
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
            if (newUser == null)
            {
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
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(userId))
            {
                return BadRequest("Invalid id or userId parameters.");
            }

            var user =  _userSupervisor.Delete(id, userId);
            if (user == null)
            {
                return NotFound();
            }

            return user;
        }
    }
}

 


