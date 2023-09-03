using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using Main.Models;
using MongoDB.Bson.Serialization.Attributes;
namespace Main.Repository
{
    public class UserData
    {
        [BsonId, BsonElement("Id"), BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
       
        public string UserId { get; set; } = string.Empty;
     
        public string TimeZone { get; set; } = string.Empty;
        
        public string EventName { get; set; } = string.Empty;
            
        public List<string> Moderator { get; set; } = new List<string>();
       
        public List<string> Connections { get; set; } = new List<string>();
     
        public string StartDate { get; set; } = string.Empty;
  
        public string EndDate { get; set; } = string.Empty;

        public bool priv { get; set; } = false;
      
        public bool Reminder { get; set; }=false;
        public UserData()
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
        public UserData(UserData other)
        {
            
            this.Id = other.Id;
            this.UserId = other.UserId;
            this.TimeZone = other.TimeZone;
            this.EventName = other.EventName;
            this.Moderator = new List<string>(other.Moderator); 
            this.Connections = new List<string>(other.Connections); 
            this.StartDate = other.StartDate;
            this.EndDate = other.EndDate;
            this.priv = other.priv;
            this.Reminder = other.Reminder;
        }
        public UserData(UserDetails userDetails)
        {
            Id = userDetails.Id;
            UserId = userDetails.UserId;
            TimeZone = userDetails.TimeZone;
            EventName = userDetails.EventName;
            Moderator = new List<string>(userDetails.Moderator);
            Connections = new List<string>(userDetails.Connections);
            StartDate = userDetails.StartDate;
            EndDate = userDetails.EndDate;
            priv = userDetails.priv;
            Reminder = userDetails.Reminder;
        }
    }
}
