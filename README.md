<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <style>
        /* Add your CSS styles here */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        header {
            background-color: #333;
            color: #fff;
            padding: 20px 0;
            text-align: center;
        }

        nav {
            background-color: #444;
            padding: 10px 0;
            text-align: center;
        }

        nav a {
            color: #fff;
            text-decoration: none;
            margin: 0 10px;
        }

        nav a:hover {
            text-decoration: underline;
        }

        section {
            padding: 20px;
        }

        footer {
            background-color: #333;
            color: #fff;
            padding: 20px 0;
            text-align: center;
            position: fixed;
            bottom: 0;
            width: 100%;
        }
    </style>
</head>

<body>

    <header>
        <h1>My Portfolio</h1>
    </header>

    <nav>
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
    </nav>

    <section id="about">
        <h2>About Me</h2>
        <p>Write a brief introduction about yourself here.</p>
    </section>

    <section id="projects">
        <h2>Projects</h2>
        <div>
            <h3>Project 1</h3>
            <p>Description of project 1.</p>
        </div>
        <div>
            <h3>Project 2</h3>
            <p>Description of project 2.</p>
        </div>
        <!-- Add more projects as needed -->
    </section>

    <section id="contact">
        <h2>Contact Me</h2>
        <p>Email: yourname@example.com</p>
        <p>Phone: +1234567890</p>
        <!-- Add more contact information or a contact form as needed -->
    </section>

    <footer>
        <p>&copy; 2024 My Portfolio</p>
    </footer>

</body>

</html>
