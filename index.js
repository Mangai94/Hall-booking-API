const Joi = require('joi');
const express = require('express');

const app = express();

//Middleware to get json body

app.use(express.json());
app.listen(3000, () => console.log('App is listening on port 3000'));

let customers = [
    {id : 1, name : "cust1", address : "Address 1", isActive : true },
    {id : 2, name : "cust2", address : "Address 2", isActive : false }
]

let rooms = [
    {id: 1, name : 'Hall 1', location : 'loc 1', amenities : ['ac', 'parking', 'cateringservice', 'fulltimesupport'], oneHourPrice : 1000},
    {id: 2, name : 'Hall 2', location : 'loc 2', amenities : ['parking', 'cateringservice', 'fulltimesupport'], oneHourPrice : 1200},
]

let customer_bookings = [
    {id : 1, custid : 1, roomid : 1, startDate : '2020-11-08 07:13:10.847', endDate : '2020-11-08 21:13:10.847'},
    {id : 2, custid : 2, roomid : 1, startDate : '2020-11-07 06:13:10.847', endDate : '2020-11-08 21:13:10.847'}
]

//Create a new room endpoint

app.post('/api/rooms', (req, res) =>{
    const schema = Joi.object({
        name : Joi.string().min(5).required(),
        amenities : Joi.array(),
        location : Joi.string().required(),
        oneHourPrice : Joi.number().required()
    });

    const {error} = schema.validate(req.body);
    if(error) return res.send(error.details[0].message);

    // Check if hall already Exists 
    
    let isPresent = rooms.find((room) => room.name == req.body.name);
    if(isPresent) return res.status(422).json({message : "Hall with the same name already Exists"});

    // Add the new entry in rooms

    const newRoom = {
        id : rooms.length +1,
        name : req.body.name,
        amenities : req.body.amenities,
        location : req.body.location,
        oneHourPrice : req.body.oneHourPrice
    };

    rooms.push(newRoom);
    return res.status(201).json({ message : "Data added successfully", data : newRoom})
});

// Book room for customer

app.post('/api/bookroom', (req, res) => {
    
    const schema = Joi.object({
        custid : Joi.number().required(),
        roomid : Joi.number().required(),
        startDate : Joi.date().required(),
        endDate : Joi.date().required()
    });

    const {error} = schema.validate(req.body);
    if(error) return res.status(400).json({message : "Bad request", data : error.details[0].message});

    // Check if the room is booked already in the same time range.

    const bookingExists = customer_bookings.find((booking) =>
            (((req.body.startDate <= booking.startDate && (req.body.endDate >= booking.startDate && req.body.endDate <= booking.endDate))
            || (req.body.endDate >= booking.startDate && req.body.endDate <= booking.endDate)))
            && booking.roomid== req.body.roomid);
    
    if(bookingExists) return res.status(422).json({message : "There is already a booking available in the same time range", data : bookingExists});

    let newBooking = {
        id : customer_bookings.length + 1,
        custid : req.body.custid,
        roomid : req.body.roomid,
        startDate : req.body.startDate,
        endDate : req.body.endDate
    }

    customer_bookings.push(newBooking);
    console.log(customer_bookings);
    return res.status(201).json({message : "Booking done successfully"})
});

// List all rooms with booked data

app.get('/api/roomsbookingstatus', (req, res) => {
    let result = [];
    let bookingViewModel;
    customer_bookings.forEach((booking) =>{
        bookingViewModel = {
            customerName : customers.find(x => x.id == booking.custid).name,
            roomName : rooms.find(x => x.id == booking.roomid).name,
            startDate : booking.startDate,
            endDate : booking.endDate
        }
        result.push(bookingViewModel);
    });

    res.send(result);
});

