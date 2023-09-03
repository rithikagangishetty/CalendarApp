using Main.Models;

namespace Main.Supervisor
{
    public interface IConnectionSupervisor
    {
        Task<string?> Delete(string emailId, string id);
        Task<List<string>> Get();
        Task<ConnectionDetails?> GetEmail(string id);
       Task<ConnectionDetails?> GetEmailId(string id);
        Task<ConnectionDetails?> GetId(string email);
        Task<ConnectionDetails?> Post(ConnectionDetails newConnection);
        Task<ConnectionDetails?> Update(ConnectionDetails updatedConnection);
    }
}