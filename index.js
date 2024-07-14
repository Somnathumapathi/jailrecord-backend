import express from 'express';
import supabase from './lib/supabase/index.js';

const app = express();
const PORT = 3000;

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200);
    res.send("Nakkan eno nindu lowde ke ball");
});

app.post('/addNewUser', async (req, res) => {
    const { role } = await req.body;
    // const { name, contact, emailId, uid } = await req.body;
    // console.log((req.body));
    if (role === "lawyer") {
        const { name, contact, emailId, uid } = await req.body;
        try {
            const query = await supabase.from('Lawyer').insert([{ name: name, contact: contact, email_id: emailId, uid: uid }]).select('id')
            if (!query.error) {
                return res.json({ msg: "Successful", data: "Lawyer id:" + query.data[0].id }).status(200);
            }
            return res.json({ msg: "unSuccessful", error: query.error }).status(400);
        } catch (e) {
            return res.json({ error: e }).status(500)
        }
    }
    else if (role === "police") {
        const { name, badge, uid } = await req.body;
        try {
            const query = await supabase.from('Police').insert([{ name: name, badge: badge, uid: uid }]).select('id')
            if (!query.error) {
                return res.json({ msg: "Successful", data: "Police id:" + query.data[0].id }).status(200);
            }
            return res.json({ msg: "unSuccessful", error: query.error }).status(400);
        } catch (e) {
            return res.json({ error: e }).status(500)
        }
    }
    if (!role)
        return res.status(400).json({ msg: "Saar idk saarrr" })
})

app.get('/getUser', async (req, res) => {
    const { uid } = req.query;
    try {
        const query = await supabase.from('Lawyer').select().eq("uid", uid);
        const { data, error } = query;
        if (!data[0]) {
            const query = await supabase.from('Police').select().eq("uid", uid);
            const { data, error } = query;
            if (!data[0]) {
                return res.json({ msg: "unsuccessful", error: error }).status(400);
            }
            return res.json({ msg: "Successful", data: data }).status(200)
        }
        return res.json({ msg: "Successful", data: data }).status(200);
    } catch (e) {
        return res.json({ error: e }).status(500)
    }
})

app.post("/createCase", async (req, res) => {
    const { prisoner_id, court_name, lawyer_id, documents, police_id } = await req.body;
    const court_query = await supabase.from("Court").select('id').eq('name', court_name);
    const court_id = court_query.data[0].id;
    if (!lawyer_id)
        lawyer_id = null
    try {
        const query = await supabase.from('Case').insert({ prisoner_id: prisoner_id, lawyer_id: lawyer_id, court_id: court_id, documents: documents, police_id: police_id }).select('id');
        const { data, error } = query;
        if (error) {
            return res.json({ msg: "unsuccessful", error: error }).status(400);
        }
        return res.json({ msg: "Successful", data: "Case id:" + query.data[0].id }).status(200);
    } catch (e) {
        return res.json({ error: e }).status(500)
    }
})

// Lawyer selecting a case
app.patch("/selectCase", async (req, res) => {
    const { case_id, lawyer_id } = await req.body;
    if (!case_id || !lawyer_id) {
        return res.status(400).json({ msg: "Boli maga na neenu??!?" })
    }
    console.log("lawyer selecting case")
    try {
        const query = await supabase.from('Case').update({ lawyer_id: lawyer_id }).eq('id', case_id).select();
        const { data, error } = query;
        if (error) {
            return res.json({ msg: "unsuccessful", error: error }).status(400);
        }
        return res.json({ msg: "Successful", data: query.data }).status(200);
    } catch (e) {
        return res.json({ error: e }).status(500)
    }
})

// Update case status
app.patch("/updateCaseStatus", async (req, res) => {
    const { case_id, status } = await req.body;
    if (!case_id || !status) {
        return res.status(400).json({ msg: "Boli maga na neenu??!?" })
    }
    console.log("updating case status")
    try {
        const query = await supabase.from('Hearing').update({ verdict: status }).eq('id', case_id).select();
        const { data, error } = query;
        if (error) {
            return res.json({ msg: "unsuccessful", error: error }).status(400);
        }
        return res.json({ msg: "Successful", data: data }).status(200);
    } catch (e) {
        return res.json({ error: e }).status(500)
    }
})

app.get("/getAllCases", async (req, res) => {
    try {
        const query = await supabase.from('Case').select('documents, Prisoners(name, status), Court(*), Police(*), Lawyer(*)');
        if (!query.error) {
            return res.json({ msg: "Successful", data: query.data }).status(200);
        }
        return res.json({ msg: "unsuccessful", error: query.error }).status(400);
    } catch (err) {
        return res.json({ error: err }).status(500)
    }
})

// Get cases from lawyer id
app.get("/getLawyersCases", async (req, res) => {
    const { lawyer_id } = req.query;
    try {
        const query = await supabase.from('Case').select('documents, Prisoners(name, status), Court(*), Police(*), Lawyer(*)').eq("lawyer_id", lawyer_id);
        if (!query.error) {
            return res.json({ msg: "Successful", data: query.data }).status(200);
        }
        return res.json({ msg: "unsuccessful", error: query.error }).status(400);
    } catch (err) {
        return res.json({ error: err }).status(500)
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