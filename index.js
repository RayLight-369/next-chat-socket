const https = require( "http" );
const express = require( "express" );
const cors = require( "cors" );
const app = express();
const server = https.createServer( app );
const SocketIO = require( "socket.io" );
const io = new SocketIO.Server( server, {
  cors: {
    origin: "http://localhost:3000"
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

    socket.emit( "connection", { msg: "connected" } );

    socket.on( "msg", ( msg, id ) => {
      io.emit( "msg", msg, id );
    } );








    socket.on( "disconnect", () => {
      console.log( socket.id, " disconnected!" );
    } );

  } catch ( e ) {
    console.log( e );
  }
} );

io.engine.on( "connection_error", console.log );


server.listen( PORT, () => console.log( `running on port ${ PORT }` ) );