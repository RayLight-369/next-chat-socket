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

    socket.on( "joined", async ( id, name ) => {
      socket.data.name = name;
      const totalUsers = ( await io.fetchSockets() ).map( ( socket_ ) => socket_.data.name );
      io.emit( "note", id, name, "joined!", totalUsers );
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