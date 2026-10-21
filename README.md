<h1 align="center" id="title">Manga Reader</h1> <p align="center" id="description">An open-source, user-friendly web platform where users can read, follow and save their favorite manga series.</p> <h2>🚀 Demo</h2>
https://monomanga.com.tr/

<h2>🛠️ Installation Steps:</h2> <p>1. Clone the project</p>
git clone https://github.com/EdizKeskin/MangaReader.git
cd MangaReader

<p>2. Install dependencies</p>
cd Server && npm install
cd ../Client && npm install

<p>3. Environment Variables</p>
Copy the env.example file inside both the Client and Server folders to .env and fill in the values. You can optionally adjust Client/config/index.js.

<p>4. Start the project</p>
On Windows, run start.bat in the root directory. On macOS or Linux, start the server and the client in two terminals:

cd Server && npm run dev
cd Client && npm run dev

<h2>💻 Built with</h2>
Client: Next.js, Tailwind, NextUI

Server: Node.js, Express, MongoDB, Firebase

<h2>🤝 Contributing</h2>
Contributions are welcome! Feel free to open an issue for bugs or feature ideas, or fork the repo and submit a pull request.

<h2>📄 License</h2>
This project is licensed under the GPL-3.0 License.
