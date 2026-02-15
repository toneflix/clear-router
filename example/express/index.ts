import "./web";

import Routes from "../../src/express/routes";
import express from "express";

const PORT = process.env.PORT || 3000;
const app: express.Application = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
    Routes.apply(router);
    app.use(router);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('Error:', err.message);
        res.status(err.status || 500).json({
            error: err.message,
            status: err.status || 500
        });
    });

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
        console.log('\nAvailable routes:');
        const routes = Routes.allRoutes();
        routes.forEach(route => {
            console.log(`  ${route.methods.join(', ').toUpperCase()} ${route.path}`);
        });
    });
})();

export default app;
