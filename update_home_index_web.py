import re

with open('src/containers/home/index.web.tsx', 'r') as f:
    content = f.read()

# Add Button near surprise me
button_code = """
          <Button
            onPress={() => this.setState({showFrentista: true})}
            style={[
              styles.calculateButton,
              {backgroundColor: '#00E096', marginTop: 15},
            ]}
            status="success">
            Simulador Frentista ⛽
          </Button>
"""
if 'Simulador Frentista' not in content:
    content = re.sub(
        r'(Me Surpreenda 🎁\n          </Button>)',
        r'\1\n' + button_code,
        content
    )

with open('src/containers/home/index.web.tsx', 'w') as f:
    f.write(content)
