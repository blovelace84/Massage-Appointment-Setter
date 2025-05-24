"use client";
//This will probably the client component that will be used to display the service card in the booking form.
import React from "react";

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number; // in minutes
}

interface ServiceCardProps {
    service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    return(
        <div className="border rounded-lg p-4 shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{service.name}</h2>
            <p className="text-gray-600 mb-2">{service.description}</p>
            <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-indigo-600">${service.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">${service.duration} min</span>
                {/* Make sure to add a booking button later */}
                {/* <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Book Now</button> */}
            </div>
        </div>
    );
};

export default ServiceCard;