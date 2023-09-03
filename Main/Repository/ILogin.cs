using Main.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarDb
{
    public interface ILogin
    {
        ConnectionData login(string EmailId);
        ConnectionData signup(ConnectionData EmailId);
    }
}
