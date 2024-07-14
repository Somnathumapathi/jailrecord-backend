import express from 'express';
import supabase from './lib/supabase/index.js';

const app = express();
const PORT = 3000;

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200);
    res.send("Welcome to root URL of Server");
});

app.post('/addNewLawyer', async (req, res) => {
    const { name, contact, emailId, uid } = await req.body;
    // console.log((req.body));
    try {
        const query = await supabase.from('Lawyer').insert([{ name: name, contact: contact, email_id: emailId, uid: uid }])
        if (!query.error) {
            return res.json({ msg: "Successful" });
        }
    } catch (e) {
        return res.json({ error: e })
    }
})

app.listen(PORT, (error) => {
    if (!error) {
        console.log("http://localhost:" + PORT)
        if (supabase) {
            console.log("Supabase connected");
        }
    }
    else
        console.log("Error occurred, server can't start", error);
}
);