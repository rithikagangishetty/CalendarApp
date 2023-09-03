
using System.Collections.Generic;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using Main.Repository;
using MongoDB.Bson.Serialization.Attributes;
namespace Main.Models
{
    public class ConnectionDetails
    {
        //Id is the object Id of the document.
        public string Id { get; set; } =string.Empty;

        // EmailId is used to store the Email of the user.
        public string EmailId { get; set; } = string.Empty;

        //Connection variable is used to store the connections of the user.
        public List<string> Connection { get; set; }=new List<string>();

        /// <summary>
        /// This the parameterized constructor which is used to convert the model to another class type. 
        /// which is used for the honeycomb architecture
        /// </summary>
        /// <param name="user">input class object</param>
        public ConnectionDetails(ConnectionData user)
        {
            Id = user.Id;
            EmailId = user.EmailId;
            Connection = user.Connection;
            
        }

        /// <summary>
        /// Empty constuctor
        /// </summary>
        public ConnectionDetails()
        {

            Id = string.Empty;
            EmailId = string.Empty;
            Connection = new List<string>();
            
        }
    }
    
}
