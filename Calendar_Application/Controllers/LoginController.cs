using Main.Models;
using Main.Supervisor;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
namespace Calenderwebapp.Controllers
    
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class LoginController : Controller
    {
        private readonly ILoginSupervisor _loginSupervisor;
        public LoginController(ILoginSupervisor loginSupervisor)
        {
            _loginSupervisor = loginSupervisor;
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
            
            var valid = IsValidEmail(userData.EmailId);
            if (userData == null&& !valid) 

            {
                
                return BadRequest("invalid data");
             
            }
            var user = _loginSupervisor.login(userData);
            if (user == null)
            {
                var final = _loginSupervisor.Signup(userData);

              
                return final;

            }
            return  user; 
           
            
        }

        /// <summary>
        /// If the email is not present it will create a new document with the given user data.
        /// </summary>
        /// <param name="userData"></param>
        /// <returns>Details of the user if it success, else badRequest</returns>
        [HttpPost]

        public ActionResult<ConnectionDetails> Signup(ConnectionDetails userData)
        {
            var valid = IsValidEmail(userData.EmailId);
            if (userData == null || !valid)
            {
                return NotFound();

            }
            var user = _loginSupervisor.Signup(userData);
            if (user == null) { return BadRequest(); }

            return user;
        }

    }
}






       

     


