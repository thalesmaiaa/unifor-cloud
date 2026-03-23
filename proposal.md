4.1 Aplicação Web
Desenvolver um sistema web com caso de uso mais elaborado, como:
● Sistema de reservas com múltiplos perfis (usuário/admin);
● Plataforma de gerenciamento de projetos;
● Sistema de pedidos com status e histórico;
● Catálogo inteligente com filtros avançados.
4.2 Requisitos Funcionais
● Autenticação e autorização
● API RESTful documentada (Swagger/OpenAPI);
● Operações CRUD completas;
● Validação de dados no back-end;
● Registro de logs de acesso e erro.
4.3 Arquitetura Técnica Obrigatória
● Front-end:
○ Framework moderno (React, Vue ou Angular);
○ Deploy em serviço de nuvem (Netlify, Vercel ou similar).
● Back-end:
○ API REST em ambiente containerizado (Docker);
○ Deploy em serviço de nuvem (Render, Railway, AWS, Azure ou GCP).
● Banco de Dados:
○ Serviço gerenciado em nuvem (Firebase, Supabase, MongoDB Atlas, RDS);
○ Persistência fora do container.
DevOps e Nuvem (Obrigatório)
● Uso de Docker para empacotamento do back-end;
● Pipeline simples de CI/CD (GitHub Actions ou similar) contendo:
○ Build;
○ Execução de testes automatizados;
○ Deploy automático.
