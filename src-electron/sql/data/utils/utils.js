

export const getNextId = async (db, tableName) => {
    const result = await db.get(`SELECT MAX(id) FROM ${tableName}`);
    console.log(result);
    return result['MAX(id)'] + 1;
}