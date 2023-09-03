using Main.Models;

namespace Main.Supervisor
{
    public interface ILoginSupervisor
    {
        ConnectionDetails? login(ConnectionDetails userdata);
        ConnectionDetails? Signup(ConnectionDetails userdata);
    }
}