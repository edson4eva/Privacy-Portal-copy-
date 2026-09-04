namespace Libs.Notification;

public interface INotificationService
{
    Task<bool> Send<T>(string template, string emailAddress, T personalization) where T : class, IPersonalisation;
}