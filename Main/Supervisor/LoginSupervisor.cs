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

namespace Main.Supervisor
{
    public class LoginSupervisor :ILoginSupervisor
    {
        private readonly ILogin _login;
        public LoginSupervisor(ILogin login) =>
           _login = login;
        /// <summary>
        /// This function checks whether the EmailId entered is already present in the database.
        /// </summary>
        /// <param name="userdata">Document of the user</param>
        /// <returns>If present the user details</returns>
        public ConnectionDetails? login(ConnectionDetails userData)
        {
            if (userData is null|| userData.EmailId is null)
            {
               
                return null;
            }

            var user = _login.login(userData.EmailId);
            if(user is null)
            {
                return null;
            }
            var result = new ConnectionDetails(user);
            
            return result;

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
        /// This function creates new document of the user that are not presen in the document
        /// </summary>
        /// <param name="userdata">Document of the user</param>
        /// <returns> the new user details that are created</returns>
        public ConnectionDetails? Signup(ConnectionDetails userData)
        {
            if(userData.EmailId is null) { return null; }
            var valid = IsValidEmail(userData.EmailId);

            if (userData == null|| !valid)
            {
               
               return null;
            }
                var finalData = new ConnectionData(userData);
                var user = _login.signup(finalData);

            if(user is null) { return null; }
                var result = new ConnectionDetails(user);
                return result;
           
        }

    }
}
