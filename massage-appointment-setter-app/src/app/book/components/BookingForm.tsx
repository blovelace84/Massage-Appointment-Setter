"use client";
import { useState } from 'react';
// Update the import path if the file is located elsewhere, for example:
import { db } from '../../../lib/firebase/client';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

export default function BookingForm() {
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const therapistId = 'example-Therapist-id';
            const availabilityDocRef = doc(db, 'therapists', therapistId, 'availability', date);
            const availabilitySnap = await getDoc(availabilityDocRef);

            if(!availabilitySnap.exists()){
                alert('No availability found for the selected date.');
                return;
                }

                const slots = availabilitySnap.data()?.slots;
                const targetSlotIndex = slots.findIndex((s: any) => s.time === time && s.available );

                if(targetSlotIndex === -1){
                    alert('Slot is not longer available or does not exist.');
                    return;
                }

                slots[targetSlotIndex].available = false;
                slots[targetSlotIndex].bookedBy = email;

                await updateDoc(availabilityDocRef, { slots });
                
                await addDoc(collection(db, 'appointments'), {
                    service,
                    date,
                    time,
                    clientName: name,
                    clientEmail: email,
                    therapistId,
                    status: 'booked',
                    createdAt: new Date(),
                });
                alert('Appointment booked successfully!');
        }catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    }
    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label>Service:</label>
                <input type="text" value={service} onChange={(e) => setService(e.target.value)} required />
            </div>
            <div>
                <label>Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
                <label>Time:</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit">Book Appointment</button>
        </form>
    );
}