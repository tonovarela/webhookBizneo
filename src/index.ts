import { envs } from "./config/env";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/Server";

(async () => {
    main();
  })();


  async function main() {    
  
    const server = new Server({
      port: envs.PORT,
      routes: AppRoutes.routes,
    });
  
    server.start();
  }