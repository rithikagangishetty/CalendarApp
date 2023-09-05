using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Main.Models;
using CalendarDb;

using System.Text.RegularExpressions;

using Microsoft.AspNetCore.Mvc;
using Main.Repository;
using Microsoft.Extensions.Logging;

namespace Main.Supervisor
{
    public class LoginSupervisor :ILoginSupervisor
    {
        private readonly ILogin _login;
        private readonly ILogger<ILoginSupervisor> _logger;
        public LoginSupervisor(ILogin login, ILogger<ILoginSupervisor> logger)
        {
            _login = login;
            _logger = logger;
        }

        /// <summary>
        /// This function checks whether the EmailId entered is already present in the database.
        /// </summary>
        /// <param name="userdata">Document of the user</param>
        /// <returns>If present the user details</returns>
        public ConnectionDetails? login(ConnectionDetails userData)
        {
            _logger.LogInformation("login method with email: {Email} is called", userData.EmailId);

            if (userData is null|| userData.EmailId is null)
            {
                _logger.LogWarning("Invalid user Data");

                return null;
            }

            var user = _login.login(userData.EmailId);
            if(user is null)
            {
                _logger.LogInformation("Email: {Email} not found", userData.EmailId);

                return null;
            }
            var result = new ConnectionDetails(user);
            _logger.LogInformation("Email: {Email} found", userData.EmailId);

            return result;

        }
        /// <summary>
        /// To check whether the entered email Id is valid or not.
        /// </summary>
        /// <param name="email">This is the email Id that is being checked</param>
        /// <returns>If it is valid true, else false</returns>
        static bool IsValidEmail(string email)
        {
            if (!string.IsNullOrEmpty(email))
            {
                string pattern = @"^[\w\.-]+@[\w\.-]+\.\w+$";

                return Regex.IsMatch(email, pattern);
            }
            return false;
        }

        /// <summary>
        /// This function creates new document of the user that are not presen in the document
        /// </summary>
        /// <param name="userdata">Document of the user</param>
        /// <returns> the new user details that are created</returns>
        public ConnectionDetails? Signup(ConnectionDetails userData)
        {
            _logger.LogInformation("Sign Up method is called");

            if(userData == null)
            {
                return null;
            }
            var valid = IsValidEmail(userData.EmailId);
            if ( !valid)
            {
                _logger.LogWarning("Email Id is invalid/null");
                return null;
            }

            var finalData = new ConnectionData(userData);
                var user = _login.signup(finalData);

            if(user is null) {
                _logger.LogWarning("Sign Up Failed");
                return null; }
                var result = new ConnectionDetails(user);
            _logger.LogWarning("Sign Up Successful");
            return result;
           
        }

    }
}
