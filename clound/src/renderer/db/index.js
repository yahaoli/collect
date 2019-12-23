import Config from "@/config";
import Datastore from 'nedb';
import path from 'path';

const env = Config.env;
const dbPath = (dbName) => path.join(Config.appPath, ('/databases/' + env + '/' + dbName + '.db'));
let __dbs = {
	log: {
		__hasLoaded: false,
		db: new Datastore({
			autoload: false,
			timestampData: true,
			filename: dbPath('log')
		})
	}
};


function db(dbName) {
	return new Promise((resolve, reject) => {
		if (typeof dbName !== "string") return reject("dbName必须是string");
		let $db = __dbs[dbName];
		if (!$db) return reject(`查无表${dbName}`);

		if ($db.__hasLoaded) return resolve($db.db);

		$db.db.loadDatabase((error) => {
			$db.__hasLoaded = true;
			$db.db.remove({
				$where: function () {
					return new Date().getTime() - this.createdAt.getTime() > 30 * 24 * 60 * 60 * 1000;
				}
			}, {multi: true}, function (err, docs) {

			})
			if (error) {
				reject(error);
			} else {
				resolve($db.db)
			}
		})

	})
}

db.list = function () {
	return __dbs;
};

export default db;
