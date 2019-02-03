package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

// TODO Change me
const cmdName = "sfeir-nosql-presentation"

var (
	BuildVersion  = "v0.0.0"
	BuildRevision = "ac7c127b4c24fba18a21601c3838ed0a05d29db9"
	BuildTime     = "2019-02-01T08:00:00+02:00"
)
var configFile string
var verbose bool

var rootCmd = &cobra.Command{
	Use:   cmdName,
	Short: "",
	Long:  ``,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	rootCmd.PersistentFlags().StringVarP(&configFile, "config", "c", "", fmt.Sprintf("config file (default \".%s.yml\")", cmdName))
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")

	// Set Default Viper configs.
	viper.SetDefault("build.version", BuildVersion)
	viper.SetDefault("build.revision", BuildRevision)
	viper.SetDefault("build.time", BuildTime)
	//viper.SetDefault("http.listener", ":8000")
	//viper.SetDefault("arango.endpoints", []string{"http://michael:azerty@localhost:8529"})
	//viper.SetDefault("arango.database", "storyline")
}

func initConfig() {
	if configFile != "" {
		viper.SetConfigFile(configFile)
	} else {
		filename := filepath.Join(".", fmt.Sprintf(".%s.yml", cmdName))
		if _, err := os.Stat(filename); os.IsNotExist(err) {
			// Default config file.
			configYml := `
http:
  listener: ":8000"
`
			err = ioutil.WriteFile(filename, []byte(configYml), 0644)
			if err != nil {
				log.Fatal(err)
			}
		}

		viper.SetConfigName(fmt.Sprintf(".%s", cmdName))
		viper.AddConfigPath(".")
	}
	viper.SetEnvPrefix(cmdName)
	viper.AutomaticEnv()
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal(err)
	}
}
