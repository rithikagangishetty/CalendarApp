
using System.Collections.Generic;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using Main.Models;
using MongoDB.Bson.Serialization.Attributes;
namespace Main.Repository
{
    public class ConnectionData
    {
        [BsonId, BsonElement("Id"), BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } =string.Empty;   

       
        public string EmailId { get; set; } = string.Empty;
        public List<string> Connection { get; set; } = new List<string>();
        public ConnectionData(ConnectionDetails user )
        {
            Id = user.Id;
            EmailId = user.EmailId;
            Connection = user.Connection;
        }
        public ConnectionData()
        {

            Id = string.Empty;
            EmailId = string.Empty;
            Connection = new List<string>();

        }
    }
   
}
