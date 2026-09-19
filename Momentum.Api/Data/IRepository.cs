using System.Linq.Expressions;

namespace Momentum.Api.Data;

public interface IRepository<T> where T : class
{
    Task<List<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null);
    Task<T?> GetByIdAsync(Guid id);
    Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    Task UpdateAsync(Guid id, T entity);
    Task DeleteAsync(Guid id);
}
