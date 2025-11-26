# Email Service Documentation

## Overview

Der Email-Service ermöglicht das Versenden von E-Mails über Gmail SMTP. Es werden drei Arten von E-Mails unterstützt:
- Einfache Text-E-Mails
- HTML-E-Mails
- Multipart-E-Mails (Text + HTML)

## Konfiguration

### Gmail App-Passwort erstellen

Um Gmail SMTP zu verwenden, benötigen Sie ein App-Passwort:

1. Gehen Sie zu [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Melden Sie sich mit Ihrem Gmail-Konto an
3. Wählen Sie "Mail" als App und "Other" als Gerät
4. Geben Sie einen Namen ein (z.B. "QuizmasTime Backend")
5. Klicken Sie auf "Generate"
6. Kopieren Sie das generierte 16-stellige Passwort

### Umgebungsvariablen setzen

Setzen Sie die folgenden Umgebungsvariablen:

```bash
# Ihre Gmail-Adresse
export MAIL_USERNAME=ihre-email@gmail.com

# Das generierte App-Passwort (ohne Leerzeichen)
export MAIL_PASSWORD=abcd efgh ijkl mnop

# Optional: Absender-Adresse (Standard: noreply@quizmastime.com)
export MAIL_FROM_ADDRESS=noreply@quizmastime.com

# Optional: Absender-Name (Standard: QuizmasTime)
export MAIL_FROM_NAME=QuizmasTime
```

### Railway Deployment

Fügen Sie in Railway die folgenden Umgebungsvariablen hinzu:
- `MAIL_USERNAME`: Ihre Gmail-Adresse
- `MAIL_PASSWORD`: Das App-Passwort
- `MAIL_FROM_ADDRESS`: (Optional) Absender-Adresse
- `MAIL_FROM_NAME`: (Optional) Absender-Name

### Google App Engine Deployment

Fügen Sie in `app.yaml` die folgenden Umgebungsvariablen hinzu:

```yaml
env_variables:
  MAIL_USERNAME: "ihre-email@gmail.com"
  MAIL_PASSWORD: "abcd efgh ijkl mnop"
  MAIL_FROM_ADDRESS: "noreply@quizmastime.com"
  MAIL_FROM_NAME: "QuizmasTime"
```

## Verwendung

### Service injizieren

```java
@Service
@RequiredArgsConstructor
public class MeinService {
    private final EmailService emailService;

    // ...
}
```

### Einfache Text-E-Mail senden

```java
emailService.sendSimpleEmail(
    "empfaenger@example.com",
    "Willkommen bei QuizmasTime",
    "Hallo! Willkommen bei QuizmasTime!"
);
```

### HTML-E-Mail senden

```java
String htmlContent = """
    <html>
        <body>
            <h1>Willkommen bei QuizmasTime</h1>
            <p>Hallo! Willkommen bei unserer Quiz-App.</p>
        </body>
    </html>
    """;

emailService.sendHtmlEmail(
    "empfaenger@example.com",
    "Willkommen bei QuizmasTime",
    htmlContent
);
```

### Multipart-E-Mail senden (Text + HTML)

```java
String textContent = "Hallo! Willkommen bei QuizmasTime!";
String htmlContent = """
    <html>
        <body>
            <h1>Willkommen bei QuizmasTime</h1>
            <p>Hallo! Willkommen bei unserer Quiz-App.</p>
        </body>
    </html>
    """;

emailService.sendMultipartEmail(
    "empfaenger@example.com",
    "Willkommen bei QuizmasTime",
    textContent,
    htmlContent
);
```

## Beispiel: Willkommens-E-Mail nach Registrierung

```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        // User erstellen
        User user = User.builder()
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .email(userDTO.getEmail())
                .build();

        User savedUser = userRepository.save(user);

        // Willkommens-E-Mail senden
        String htmlContent = String.format("""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h1 style="color: #d32f2f;">Willkommen bei QuizmasTime! 🎄</h1>
                    <p>Hallo %s,</p>
                    <p>vielen Dank für deine Registrierung bei QuizmasTime!</p>
                    <p>Jeden Tag vom 1. bis 24. Dezember wartet eine neue Quiz-Frage auf dich.</p>
                    <p>Viel Spaß beim Rätseln!</p>
                </body>
            </html>
            """, user.getFirstName());

        emailService.sendHtmlEmail(
            user.getEmail(),
            "Willkommen bei QuizmasTime! 🎄",
            htmlContent
        );

        return mapToDTO(savedUser);
    }
}
```

## Fehlerbehandlung

Der EmailService wirft eine `RuntimeException`, wenn das Senden fehlschlägt. Fehler werden geloggt.

```java
try {
    emailService.sendSimpleEmail(
        "empfaenger@example.com",
        "Test",
        "Test-Nachricht"
    );
} catch (RuntimeException e) {
    log.error("E-Mail konnte nicht gesendet werden", e);
    // Fehler behandeln
}
```

## Lokale Entwicklung

Für die lokale Entwicklung können Sie die Umgebungsvariablen in Ihrer IDE setzen oder eine `.env`-Datei verwenden (nicht committen!):

```bash
# .env
MAIL_USERNAME=ihre-email@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
```

## Troubleshooting

### "Authentication failed"
- Überprüfen Sie, ob Sie ein App-Passwort verwenden (nicht Ihr normales Gmail-Passwort)
- Stellen Sie sicher, dass 2-Faktor-Authentifizierung für Ihr Gmail-Konto aktiviert ist

### "Connection timeout"
- Überprüfen Sie Ihre Netzwerkverbindung
- Stellen Sie sicher, dass Port 587 nicht blockiert ist

### "Invalid Addresses"
- Überprüfen Sie, ob die E-Mail-Adressen korrekt formatiert sind
- Stellen Sie sicher, dass `MAIL_FROM_ADDRESS` eine gültige E-Mail-Adresse ist
