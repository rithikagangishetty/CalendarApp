using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Main.Repository;
namespace CalendarDb
{
    public  interface IConnection
    {
        Task<ConnectionData> Get(string id);
        Task<ConnectionData> GetId(string EmailId);

        Task Create(ConnectionData newUser);

        Task Update(ConnectionData connection,List<string>updatedConnection);
        Task<List<ConnectionData>> GetAll();
        Task Remove(string id);
    }
}
