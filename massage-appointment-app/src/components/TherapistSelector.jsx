import React, { useState, useEffect, use} from "react";
import { db } from '../firebaseConfig';
import { collection, doc, getDocs } from "firebase/firestore";

const TherapistSelector = ({ selectedThereapistId, onSelectTherapist, onTherapistsLoaded, disabiled}) => {
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetcheTherapists = async () => {
            setLoading(true);
            setError('');
            try{
                const querySnapshot = await getDocs(collection(db, "therapists"));
                const fetchedTherapists = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTherapists(fetcheTherapists);
                if(onTherapistsLoaded){
                    onTherapistsLoaded(fetchedTherapists);
                }
            }catch(e) {
                console.error("Error fetching therapists:", e);
                setError('Failed to load therapists. Please try again later.');
            }finally{
                setLoading(false);
            }
        }
        fetcheTherapists();
    },[]); //Empty dependency array to run only once on mount
    if(loading){
        return <p>Loading therapists...</p>
    }

    return(
        <div>
            <label htmlFor="therapist">Select Therapist:</label>
            <select 
                name="therapist" 
                id="therapist"
                value={selectedThereapistId || ''} //handle initial empty state
                onChange={(e) => onSelectTherapist(e.target.value)}
                required
                disabled={disabiled}>
                    <option value="">-- Any Available Therapist --</option> 
                    {therapists.map(therapists => (
                        <option value={therapists.id} key={therapists.id}>
                            {therapists.name} 
                        </option>
                    ))}
                </select>
        </div>
    );
}

export default TherapistSelector;