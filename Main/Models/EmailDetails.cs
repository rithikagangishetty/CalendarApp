using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using Main.Repository;
using System.Collections.Generic;

namespace Main.Models
{
    public class EmailDetails
    {
        

        public string Body { get; set; } =string.Empty;
        public string Id { get; set; } = string.Empty;  
       
        public string UserEmail { get; set; } = string.Empty;
        
        public string EventName { get; set; } = string.Empty;
        
        public List<string> Moderator { get; set; } = new List<string>();
       
        public List<string> Connections { get; set; } = new List<string>();
        
        public string StartDate { get; set; } = string.Empty;
       
        public string EndDate { get; set; } = string.Empty;
     
        public string Subject { get; set; } = string.Empty; 
      
        public bool Delete { get; set; }

        public bool priv { get; set; }
        /// <summary>
        /// This the parameterized constructor which is used to convert the model to another class type. 
        /// which is used for the honeycomb architecture
        /// </summary>
        /// <param name="emailData">input class object</param>
        public EmailDetails(EmailData emailData)
        {
            Body = emailData.Body;
            Id = emailData.Id;
            UserEmail = emailData.UserEmail;
            Delete = emailData.Delete;
            Subject = emailData.Subject;
            EndDate = emailData.EndDate;
            StartDate = emailData.StartDate;
            EventName = emailData.EventName;
            priv = emailData.priv;
            Connections = emailData.Connections;
            Moderator = emailData.Moderator;
        }

        /// <summary>
        /// Empty constuctor
        /// </summary>
        public EmailDetails()
        {
            Body = string.Empty;
            Id = string.Empty;
            UserEmail = string.Empty;
            Delete = false;
            Subject = string.Empty;
            EndDate = string.Empty;
            StartDate = string.Empty;
            EventName = string.Empty;
            priv = false;
            Connections = new List<string>();
            Moderator = new List<string>();
        }
    }
}
