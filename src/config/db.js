import mongoose from 'mongoose';

export const connDB = async (url, dbName) => {
    try {
        await mongoose.connect(`${url}/${dbName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        process.exit(1); 
    }
}       