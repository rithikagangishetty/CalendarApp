using Main.Models;
using Main.Supervisor;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;
namespace Calenderwebapp.Controllers
    
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class LoginController : Controller
    {
        private readonly ILoginSupervisor _loginSupervisor;
        private readonly ILogger<LoginController> _logger;
        public LoginController(ILoginSupervisor loginSupervisor, ILogger<LoginController> logger)
        {
            _loginSupervisor = loginSupervisor;
            _logger = logger;
        }

        /// <summary>
        /// To check whether the entered email Id is valid or not.
        /// </summary>
        /// <param name="email">This is the email Id that is being checked</param>
        /// <returns>If it is valid true, else false</returns>
        static bool IsValidEmail(string email)
        {
            string pattern = @"^[\w\.-]+@[\w\.-]+\.\w+$";
            return Regex.IsMatch(email, pattern);
        }

        /// <summary>
        /// This API call is to check whether the entered emailId is present in the Database or not
        /// </summary>
        /// <param name="userData"></param>
        /// <returns>if userData is not found badRequest is sent or else the user details will be sent</returns>
        [HttpPost]
       
        public ActionResult<ConnectionDetails> Login(ConnectionDetails userData)
        {
            _logger.LogInformation("Login process started for user with email: {Email}", userData.EmailId);

            var valid = IsValidEmail(userData.EmailId);
            if (userData == null&& !valid) 

            {
                _logger.LogWarning("Invalid user data received in the login request.");
                return BadRequest("Invalid data");
             
            }
            var user = _loginSupervisor.login(userData);
            if (user == null)
            {
                _logger.LogInformation("User not found. Signing up user with email: {Email}", userData.EmailId);
                var final = _loginSupervisor.Signup(userData);
                _logger.LogInformation("User signed up successfully with email: {Email}", userData.EmailId);
                return final;

            }
            _logger.LogInformation("User logged in successfully.");
            return user; 
           
            
        }

        /// <summary>
        /// If the email is not present it will create a new document with the given user data.
        /// </summary>
        /// <param name="userData"></param>
        /// <returns>Details of the user if it success, else badRequest</returns>
        //[HttpPost]

        //public ActionResult<ConnectionDetails> Signup(ConnectionDetails userData)
        //{
        //    var valid = IsValidEmail(userData.EmailId);
        //    if (userData == null || !valid)
        //    {
               
        //        return NotFound();
        //    }
        //    var user = _loginSupervisor.Signup(userData);
        //    if (user == null) { return BadRequest(); }

        //    return user;
        //}

    }
}






       

     


