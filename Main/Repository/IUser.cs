using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Main.Repository;
namespace CalendarDb
{
    public interface IUser
    {
        public Task<List<UserData>> Get(string Id);

        public Task<List<UserData>> GetConnections(string Id);
        public Task<UserData> GetId(string Id);
        public void Update(UserData updatedUser);
        public void Remove(string id);
        public void SendEmail(EmailData user);
        public void Create(UserData newUser);
      public Task RunReminderTask();
        public void StartReminderTimer();



    }

}
