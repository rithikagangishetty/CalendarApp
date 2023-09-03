using Main.Models;



namespace Main.Supervisor
{
    public interface IUserSupervisor
    {
        UserDetails? Delete(string id, string userId);
        Task<UserDetails> Filtering(UserDetails newUser);
        Task<UserDetails> Overlap(UserDetails newUser);
        Task<UserDetails> CheckConnections(UserDetails newUser, UserDetails user);
        Task<UserDetails?> GetEvent(string id);
        Task<List<UserDetails>?> GetEvents(string id);
        Task<List<UserDetails>?> GetView(string id, string connectionId);
        Task<UserDetails?> Post(UserDetails newUser);
        Task<EmailDetails?> SendMail(EmailDetails id);
        //Task SimulateConcurrentRequests();
        bool CheckOverlap(UserDetails newUser, UserDetails existingUser);
        Task<UserDetails?> Update(UserDetails updatedUser);
    }
}