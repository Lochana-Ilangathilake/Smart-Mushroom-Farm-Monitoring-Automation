import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAfJljEqbAjf8PrkBsaWzFkZDKmZIOl7jY",
    databaseURL: "https://smart-mushroom-greenhous-f2190-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
