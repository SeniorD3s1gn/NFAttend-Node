using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
namespace WpfApp1
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        NFCReader reader = new NFCReader();
        public MainWindow()
        {
            InitializeComponent();
            read();
        }
        void read()
        {
            reader.CardInserted += new NFCReader.CardEventHandler(tagOn);//this intializes the events for when a card is placed on and its corresponding function
            reader.CardEjected += new NFCReader.CardEventHandler(tagOff);

            reader.Watch(); //this begins intiliazes the method that will listen for an event on the reader
        }

        public void tagOn()
        {
            try
            {
                if (reader.Connect())
                {
                    Debug.WriteLine(reader.GetCardUID());
                    
                }
                else
                {
                    Debug.WriteLine("didnt connect");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Something went wrong in tag on method" + ex.Message);
            }
        }

        public void tagOff()
        {
            reader.Disconnect();
            Debug.WriteLine("Disconnected");
        }
    }
}
