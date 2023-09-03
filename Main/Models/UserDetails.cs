using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Main.Repository;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace Main.Models
{


    public class UserDetails
    {
       

      



        public string Id { get; set; } = string.Empty;
        
        public string UserId { get; set; } = string.Empty;
      
        public string TimeZone { get; set; } = string.Empty;
       
        public string EventName { get; set; } = string.Empty;
    
        public List<string> Moderator { get; set; } = new List<string>();
        
        public List<string> Connections { get; set; } = new List<string>();
        
        public string StartDate { get; set; } = string.Empty;
       
        public string EndDate { get; set; } = string.Empty; 
        
        public bool priv { get; set; } = false;
        
        public bool Reminder { get; set; } = false;
        public UserDetails()
        {
           
            Id = string.Empty;
            UserId = string.Empty;
            TimeZone = string.Empty;
            EventName = string.Empty;
            Moderator = new List<string>();
            Connections = new List<string>();
            StartDate = string.Empty;
            EndDate = string.Empty;
            priv = false;
            Reminder = false;
        }

        /// <summary>
        /// This the parameterized constructor 
        /// </summary>
        /// <param name="other">input class object</param>
        public UserDetails(UserDetails other)
        {
            
            this.Id = other.Id;
            this.UserId = other.UserId;
            this.TimeZone = other.TimeZone;
            this.EventName = other.EventName;
            this.Moderator = new List<string>(other.Moderator); // Deep copy of Moderator list
            this.Connections = new List<string>(other.Connections); // Deep copy of Connections list
            this.StartDate = other.StartDate;
            this.EndDate = other.EndDate;
            this.priv = other.priv;
            this.Reminder = other.Reminder;
        }

        /// <summary>
        /// This the parameterized constructor which is used to convert the model to another class type. 
        /// which is used for the honeycomb architecture
        /// </summary>
        /// <param name="userData">input class object</param>
        public UserDetails(UserData userData)
        {
            Id = userData.Id;
            UserId = userData.UserId;
            TimeZone = userData.TimeZone;
            EventName = userData.EventName;
            Moderator = new List<string>(userData.Moderator);
            Connections = new List<string>(userData.Connections);
            StartDate = userData.StartDate;
            EndDate = userData.EndDate;
            priv = userData.priv;
            Reminder = userData.Reminder;
        }

    }
}
