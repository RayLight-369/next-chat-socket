const https = require( "http" );
const express = require( "express" );
const cors = require( "cors" );
const app = express();
const server = https.createServer( app );
const SocketIO = require( "socket.io" );
const io = new SocketIO.Server( server, {
  cors: {
    origin: [ "http://localhost:3000", "https://raytalk.vercel.app" ]
  }
} );
// , {
//   cors: {
//     origin: "https://recho-six.vercel.app",
//       methods: [ "GET", "POST" ],
//         transports: [ 'websocket', 'polling' ],
//           credentials: true;
//   },
//   allowEIO3: true,

// }
const PORT = 5261;


app.use( cors() );


app.get( "/", ( _, res ) => {
  res.send( "Hello, world!" );
} );




io.on( "connection", async ( socket ) => {

  console.log( socket.id, " connected!" );

  // console.log( await io.fetchSockets() );

  try {

    socket.on( "joined", async ( name ) => {
      socket.data.name = name;

      socket.emit( "totalUsers", ( await io.fetchSockets() ).map( ( socket_ ) => ( { name: socket_.data.name, id: socket_.id } ) ).filter( user => user.name.trim().length ) );
      io.emit( "note", socket.id, name, "joined!" );

    } );

    socket.on( "msg", ( msg, id, name, media, audio, date ) => {
      io.emit( "msg", msg, id, name, media, audio, date );
    } );

    socket.on( "typing", ( name ) => {
      socket.broadcast.emit( "typing", name );
    } );

    socket.on( "stop typing", ( name ) => {
      socket.broadcast.emit( "stop typing", name );
    } );



    socket.on( 'join-call', ( { roomId } ) => {
      socket.join( roomId );
      socket.to( roomId ).emit( 'user-joined-call', { socketId: socket.id } );
    } );

    socket.on( 'send-signal', ( { userToSignal, from, signal } ) => {
      io.to( userToSignal ).emit( 'receive-signal', { signal, from } );
    } );

    socket.on( 'leave-call', ( { roomId } ) => {
      socket.to( roomId ).emit( 'user-left-call', { socketId: socket.id } );
      socket.leave( roomId );
    } );



    socket.on( "disconnect", () => {
      console.log( socket.id, " disconnected!" );
      io.emit( "note", socket.id, socket.data.name, "left!" );
    } );

  } catch ( e ) {
    console.log( e );
  }
} );

io.engine.on( "connection_error", console.log );


server.listen( PORT, () => console.log( `running on port ${ PORT }` ) );