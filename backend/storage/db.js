import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

// Simple JSON-based storage (good enough for hackathon)
class SimpleDB {
    constructor(filename) {
        this.filepath = path.join(DATA_DIR, filename);
        this.data = this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                return JSON.parse(fs.readFileSync(this.filepath, 'utf-8'));
            }
        } catch (error) {
            console.error(`Error loading ${this.filepath}:`, error.message);
        }
        return {};
    }

    save() {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error(`Error saving ${this.filepath}:`, error.message);
        }
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        this.save();
    }

    getAll() {
        return this.data;
    }

    delete(key) {
        delete this.data[key];
        this.save();
    }
}

// Database instances
export const projectsDB = new SimpleDB('projects.json');
export const researchDB = new SimpleDB('research.json');
export const notesDB = new SimpleDB('notes.json');
export const chatDB = new SimpleDB('chat_history.json');