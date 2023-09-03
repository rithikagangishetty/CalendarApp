using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Collections.Generic;
using Main.Models;

namespace Main.Repository
{
    public class EmailData
    {
        [BsonId, BsonElement("Id"), BsonRepresentation(BsonType.ObjectId)]

        public string Body { get; set; } = string.Empty;    
        public string Id { get; set; }= string.Empty;
        public string UserEmail { get; set; }=string.Empty;
       
        public string EventName { get; set; } = string.Empty;
       
        public List<string> Moderator { get; set; } = new List<string>();
        
        public List<string> Connections { get; set; }= new List<string>();
        
        public string StartDate { get; set; } = string.Empty;
       
        public string EndDate { get; set; } = string.Empty;
       
        public string Subject { get; set; } = string.Empty; 
      
        public bool Delete { get; set; }
      
        public bool priv { get; set; }
        public  EmailData(EmailDetails emailDetails)
        {
            Body= emailDetails.Body;
            Id= emailDetails.Id;
            UserEmail= emailDetails.UserEmail;
            Delete= emailDetails.Delete;
            Subject= emailDetails.Subject;
            EndDate= emailDetails.EndDate;
            StartDate= emailDetails.StartDate;
            EventName= emailDetails.EventName;
            priv = emailDetails.priv;
            Connections= emailDetails.Connections;
            Moderator= emailDetails.Moderator;
        }
        public EmailData()
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
