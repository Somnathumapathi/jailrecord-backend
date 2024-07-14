import express from 'express';
import supabase from './lib/supabase/index.js';

const app = express();
const PORT = 3000;

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200);
    res.send("Welcome to root URL of Server");
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
                return res.json({ msg: "Successful", data: "Lawyer id:"+query.data });
            }
        } catch (e) {
            return res.json({ error: e })
        }
    }
    else if (role === "police") {
        const { name, badge, uid } = await req.body;
        try {
            const query = await supabase.from('Police').insert([{ name: name, badge: badge, uid: uid }]).select('id')
            if (!query.error) {
                return res.json({ msg: "Successful", data: "Police id:"+query.data });
            }
        } catch (e) {
            return res.json({ error: e })
        }
    }
    return res.status(400).json({msg: "Saar idk saarrr"})
})

app.post("/createCase", async (req, res) => {
    const { prisoner_id, court_id, lawyer_id, documents, police_id } = await req.body;
    try {
        const query = await supabase.from('Case').insert({ prisoner_id: prisoner_id, lawyer_id: lawyer_id, court_id: court_id, documents: documents, police_id: police_id }).select('id');
        const { data, error } = query;
        if (error) {
            return res.json({ msg: "unsuccessful", error: error });
        }
        return res.json({ msg: "Successful", data: "Case id:" + query.data[0].id });
    } catch (e) {
        return res.json({ error: e })
    }
})

// app.patch("/updateCase", async(req,res) => {
//     const { prisoner_id, court_id, lawyer_id, documents, police_id} = await req.body;
//     console.log("creating case")
//     try {
//         const query = await supabase.from('Case').insert({ prisoner_id: prisoner_id, lawyer_id: lawyer_id, court_id: court_id, documents: documents, police_id: police_id }).select('id');
//         console.log("after query");
//         const { data, error } = query;
//         if (error) {
//             return res.json({msg:"unsuccessful", error: error});
//         }
//         return res.json({ msg: "Successful", data: "Case id:"+query.data[0].id });
//     } catch (e) {
//         return res.json({ error: e })
//     }
// })

app.get("/getAllCases", async (req, res) => {
    try {
        const query = await supabase.from('Case').select('documents, Prisoners(name, status), Court(*), Police(*), Lawyer(*)');
        if (!query.error) {
            return res.json({ msg: "Successful", data: query.data });
        }
        return res.json({ msg: "unsuccessful", error: query.error });
    } catch (err) {
        return res.json({ error: err })
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