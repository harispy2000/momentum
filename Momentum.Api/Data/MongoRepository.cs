using System.Collections.Concurrent;
using System.Linq.Expressions;
using System.Reflection;
using MongoDB.Driver;

namespace Momentum.Api.Data;

public class MongoRepository<T> : IRepository<T> where T : class
{
    private readonly IMongoCollection<T>? _collection;
    private readonly ConcurrentDictionary<Guid, T> _fallbackStore = new();
    private readonly PropertyInfo? _idProp;
    private readonly ILogger<MongoRepository<T>> _logger;

    public MongoRepository(IMongoDatabase? database, string collectionName, ILogger<MongoRepository<T>> logger)
    {
        _logger = logger;
        _idProp = typeof(T).GetProperty("Id");

        if (database != null)
        {
            try
            {
                _collection = database.GetCollection<T>(collectionName);
                _logger.LogInformation("Repository for {Type} initialized with MongoDB collection '{CollectionName}'.", typeof(T).Name, collectionName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize MongoDB collection '{CollectionName}'. Operating in fallback in-memory mode.", collectionName);
                _collection = null;
            }
        }
        else
        {
            _logger.LogInformation("No MongoDB database provided. Repository for {Type} using in-memory store.", typeof(T).Name);
        }
    }

    private Guid GetEntityId(T entity)
    {
        if (_idProp == null) return Guid.Empty;
        var val = _idProp.GetValue(entity);
        return val is Guid g ? g : Guid.Empty;
    }

    public async Task<List<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (_collection != null)
        {
            try
            {
                var filter = predicate ?? (_ => true);
                var cursor = await _collection.FindAsync(filter);
                return await cursor.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MongoDB GetAllAsync failed, falling back to in-memory store for {Type}.", typeof(T).Name);
            }
        }

        var query = _fallbackStore.Values.AsQueryable();
        if (predicate != null)
        {
            query = query.Where(predicate);
        }
        return query.ToList();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        if (_collection != null && _idProp != null)
        {
            try
            {
                var filter = Builders<T>.Filter.Eq("Id", id);
                var cursor = await _collection.FindAsync(filter);
                return await cursor.FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MongoDB GetByIdAsync failed for ID {Id}, falling back to in-memory store for {Type}.", id, typeof(T).Name);
            }
        }

        _fallbackStore.TryGetValue(id, out var entity);
        return entity;
    }

    public async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate)
    {
        if (_collection != null)
        {
            try
            {
                var cursor = await _collection.FindAsync(predicate);
                return await cursor.FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MongoDB FindOneAsync failed, falling back to in-memory store for {Type}.", typeof(T).Name);
            }
        }

        return _fallbackStore.Values.AsQueryable().FirstOrDefault(predicate);
    }

    public async Task AddAsync(T entity)
    {
        var id = GetEntityId(entity);
        if (_collection != null)
        {
            try
            {
                await _collection.InsertOneAsync(entity);
                _fallbackStore[id] = entity;
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MongoDB AddAsync failed, saving to in-memory store for {Type}.", typeof(T).Name);
            }
        }

        _fallbackStore[id] = entity;
        await Task.CompletedTask;
    }

    public async Task UpdateAsync(Guid id, T entity)
    {
        if (_collection != null && _idProp != null)
        {
            try
            {
                var filter = Builders<T>.Filter.Eq("Id", id);
                await _collection.ReplaceOneAsync(filter, entity, new ReplaceOptions { IsUpsert = true });
                _fallbackStore[id] = entity;
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MongoDB UpdateAsync failed for ID {Id}, updating in-memory store for {Type}.", id, typeof(T).Name);
            }
        }

        _fallbackStore[id] = entity;
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        if (_collection != null && _idProp != null)
        {
            try
            {
                var filter = Builders<T>.Filter.Eq("Id", id);
                await _collection.DeleteOneAsync(filter);
                _fallbackStore.TryRemove(id, out _);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MongoDB DeleteAsync failed for ID {Id}, deleting from in-memory store for {Type}.", id, typeof(T).Name);
            }
        }

        _fallbackStore.TryRemove(id, out _);
        await Task.CompletedTask;
    }
}
