```markdown
# AGENTS.md - AI Coding Agent Guidelines

These guidelines outline the principles and rules for development of this AI coding agent repository. Adherence to these principles is crucial for maintaining a sustainable, maintainable, and high-quality codebase.

## 1. DRY (Don't Repeat Yourself)

*   Every concept, function, and class should have a single, clearly defined purpose.
*   Avoid duplicating logic or data structures.
*   Refactor when a common pattern is identified and reused.

## 2. KISS (Keep It Simple, Stupid)

*   Prioritize readability and simplicity over complex solutions.
*   Design for ease of understanding and maintenance.
*   Avoid unnecessary abstractions or complexities.
*   Focus on core functionality; avoid feature creep.

## 3. SOLID Principles

*   **Single Responsibility Principle:** Each class/module should have one, and only one, reason to change.
*   **Open/Closed Principle:**  The system should be extensible without modifying the core implementation. (Requires APIs)
*   **Liskov Substitution Principle:**  Subclasses should be able to replace all their base class implementations without affecting the correctness of the program.
*   **Interface Segregation Principle:** Clients should not be forced to implement interfaces they do not use.
*   **Dependency Inversion Principle:** Client code should not depend on implementation details; they should depend on abstractions.

## 4. YAGNI (You Aren't Gonna Need It)

*   Implement functionality only when absolutely necessary.
*   Avoid adding features or code without a clear and demonstrable need.
*   Focus on delivering working code first, and add complexity later.

## 5. Code Quality & Structure

*   **File Size Limit:** Each file must be no more than 180 lines of code.
*   **Naming Conventions:**  Use consistent and descriptive naming conventions. (See example in README)
*   **Comments:**  Provide concise and informative comments explaining complex logic or non-obvious choices.  Do *not* write comments explaining code—code should explain itself.
*   **Code Formatting:**  Follow a consistent code formatting style (e.g., using `black` for Python).  Automatic formatting is preferred.
*   **Error Handling:** Implement basic error handling for potential exceptions.  Don't expose internal logic to the public.
*   **Data Structures:** Choose appropriate data structures for each task, based on performance and maintainability.
*   **Testing:**  All code must be thoroughly tested with unit tests.

## 6. Development Workflow

*   **Version Control:** Use Git for version control. Commit frequently and with clear commit messages.
*   **Code Review:** All code must undergo peer review before merging.
*   **Static Analysis:**  Use static analysis tools (e.g., pylint, flake8) to identify potential issues and enforce coding standards.
*   **Integration Testing:**  Focus on integration testing to ensure components work together correctly.

## 7. Testing

*   **Unit Tests:** A minimum of 80% of the code must be covered by unit tests.
*   **Test-Driven Development (TDD):**  Consider using TDD principles (write tests before code) for new functionality.
*   **Test Data Management:**  Use realistic and representative test data.
*   **Coverage Reporting:**  Utilize code coverage tools to ensure tests are executed adequately.

## 8.  Specific Considerations

*   **Agent Types:** Clearly define the different agent types and their responsibilities.
*   **Communication Protocols:** Define clear communication protocols between agents.
*   **Data Serialization/Deserialization:**  Use a consistent and efficient serialization/deserialization mechanism.
*   **Error Handling Strategy:** Implement a defined error handling strategy with configurable behavior.

## 9.  README

*   Include a detailed README explaining this document and its purpose.
*   Provide examples of how to run the tests and interact with the agent.
*   Document any dependencies or required tools.

## 10.  Maintainability

*   Document APIs (if applicable) clearly.
*   Maintain a well-organized codebase with a clear structure.
*   Use meaningful variable names and comments.

These guidelines are crucial for maintaining a robust and efficient AGENTS.md repository and ensure it meets the required standards for the AI coding agent project.
```