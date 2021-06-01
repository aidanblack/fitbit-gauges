function gaugesSettings(props) {
    return (
        <Page>
            <Section
                title={<Text bold>Gauges Settings</Text>}>
                <Select
                    label={`Temperature Unit`}
                    settingsKey="tempUnit"
                    options={[
                        { name: "Celsius" },
                        { name: "Farenheit" }
                    ]}
                />
            </Section>
        </Page>
    );
}

registerSettingsPage(gaugesSettings);