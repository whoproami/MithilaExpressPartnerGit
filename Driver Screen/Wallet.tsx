import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '../routes/AppStack';
import {AppwriteContext} from '../appwrite/AuthContext';
import {DatabaseContext} from '../appwrite/DatabaseContext';
import Snackbar from 'react-native-snackbar';

type WalletScreenProps = NativeStackScreenProps<AppStackParamList, 'Wallet'>;

type Transaction = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
};

const WalletScreen: React.FC<WalletScreenProps> = ({navigation}) => {
  const {appwrite} = useContext(AppwriteContext);
  const {appwritedb} = useContext(DatabaseContext);

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [addMoneyModalVisible, setAddMoneyModalVisible] =
    useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<
    'upi' | 'card' | 'netbanking'
  >('upi');
  const [minimumBalanceAlert, setMinimumBalanceAlert] = useState<boolean>(
    balance < 100,
  );

  useEffect(() => {
    console.log('Modal visibility changed:', addMoneyModalVisible);
  }, [addMoneyModalVisible]);

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await appwrite.getCurrentUser();

      if (!currentUser) {
        throw new Error('User not logged in');
      }

      // Simulate API call to get wallet data
      // In a real app, fetch this from your backend
      setTimeout(() => {
        // Mock data for demonstration
        const mockBalance = 250.75;
        const mockTransactions = [
          {
            id: 'txn_001',
            amount: 100,
            type: 'credit',
            description: 'Added money to wallet',
            timestamp: new Date(2025, 2, 25, 12, 30),
            status: 'completed',
          },
          {
            id: 'txn_002',
            amount: 24.5,
            type: 'debit',
            description: 'Commission for Ride #RD45872',
            timestamp: new Date(2025, 2, 24, 18, 45),
            status: 'completed',
          },
          {
            id: 'txn_003',
            amount: 150,
            type: 'credit',
            description: 'Added money to wallet',
            timestamp: new Date(2025, 2, 20, 9, 15),
            status: 'completed',
          },
          {
            id: 'txn_004',
            amount: 18.75,
            type: 'debit',
            description: 'Commission for Ride #RD45801',
            timestamp: new Date(2025, 2, 19, 14, 30),
            status: 'completed',
          },
          {
            id: 'txn_005',
            amount: 200,
            type: 'credit',
            description: 'Added money to wallet',
            timestamp: new Date(2025, 2, 15, 10, 0),
            status: 'completed',
          },
        ] as Transaction[];

        setBalance(mockBalance);
        setTransactions(mockTransactions);
        setIsLoading(false);
        setRefreshing(false);
        setMinimumBalanceAlert(mockBalance < 100);
      }, 1500);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setIsLoading(false);
      setRefreshing(false);
      Snackbar.show({
        text: 'Failed to load wallet data',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  // Add money to wallet
  const handleAddMoney = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Snackbar.show({
        text: 'Please enter a valid amount',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    setProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      setAddMoneyModalVisible(false);

      // Add new transaction
      const newTransaction: Transaction = {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        amount: parseFloat(amount),
        type: 'credit',
        description: 'Added money to wallet',
        timestamp: new Date(),
        status: 'completed',
      };

      // Update balance and transactions
      setBalance(prev => prev + parseFloat(amount));
      setTransactions(prev => [newTransaction, ...prev]);

      setAmount('');

      Snackbar.show({
        text: `₹${amount} added to your wallet successfully`,
        duration: Snackbar.LENGTH_SHORT,
      });
    }, 2000);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          onPress={() => fetchWalletData()}
          style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E88801" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              {balance < 100 && (
                <View style={styles.lowBalanceBadge}>
                  <Text style={styles.lowBalanceText}>Low Balance</Text>
                </View>
              )}
            </View>
            <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={() => setAddMoneyModalVisible(true)}>
              <Text style={styles.addMoneyButtonText}>ADD MONEY</Text>
            </TouchableOpacity>
          </View>

          {/* Low Balance Warning */}
          {minimumBalanceAlert && (
            <View style={styles.warningCard}>
              <MaterialIcons name="warning" size={20} color="#E88801" />
              <Text style={styles.warningText}>
                Low balance! Add money to your wallet to ensure uninterrupted
                service.
              </Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>How it works</Text>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="account-balance-wallet"
                size={20}
                color="#555"
              />
              <Text style={styles.infoText}>
                Add money to your wallet to pay platform commissions
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="directions-car" size={20} color="#555" />
              <Text style={styles.infoText}>
                Commission is automatically deducted after each ride
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="error-outline" size={20} color="#555" />
              <Text style={styles.infoText}>
                Maintain a minimum balance of ₹100 to avoid service
                interruptions
              </Text>
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.transactionsContainer}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyTransactions}>
                <MaterialIcons name="receipt-long" size={40} color="#ccc" />
                <Text style={styles.emptyTransactionsText}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              transactions.map(transaction => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionIconContainer}>
                    <View
                      style={[
                        styles.transactionIcon,
                        transaction.type === 'credit'
                          ? styles.creditIcon
                          : styles.debitIcon,
                      ]}>
                      <MaterialIcons
                        name={transaction.type === 'credit' ? 'add' : 'remove'}
                        size={20}
                        color="white"
                      />
                    </View>
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.timestamp)} at{' '}
                      {formatTime(transaction.timestamp)}
                    </Text>
                  </View>

                  <View style={styles.transactionAmount}>
                    <Text
                      style={[
                        styles.transactionAmountText,
                        transaction.type === 'credit'
                          ? styles.creditText
                          : styles.debitText,
                      ]}>
                      {transaction.type === 'credit' ? '+' : '-'}₹
                      {transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Money Modal */}
      <Modal
        visible={addMoneyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddMoneyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setAddMoneyModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                editable={!processingPayment}
              />
            </View>

            <View style={styles.quickAmounts}>
              {[100, 200, 500, 1000].map(quickAmount => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                  disabled={processingPayment}>
                  <Text style={styles.quickAmountText}>₹{quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.paymentMethods}>
              <Text style={styles.paymentMethodsTitle}>Payment Method</Text>

              <View style={styles.paymentMethodOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === 'upi' && styles.selectedPaymentMethod,
                  ]}
                  onPress={() => setPaymentMethod('upi')}
                  disabled={processingPayment}>
                  {/* <Image
                    source={require('../assets/asset/upi.png')}
                    style={styles.paymentMethodIcon}
                    resizeMode="contain"
                  /> */}
                  <Text style={styles.paymentMethodText}>UPI</Text>
                  {paymentMethod === 'upi' && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#E88801"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === 'card' && styles.selectedPaymentMethod,
                  ]}
                  onPress={() => setPaymentMethod('card')}
                  disabled={processingPayment}>
                  <FontAwesome name="credit-card" size={20} color="#555" />
                  <Text style={styles.paymentMethodText}>Card</Text>
                  {paymentMethod === 'card' && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#E88801"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === 'netbanking' &&
                      styles.selectedPaymentMethod,
                  ]}
                  onPress={() => setPaymentMethod('netbanking')}
                  disabled={processingPayment}>
                  <MaterialIcons
                    name="account-balance"
                    size={20}
                    color="#555"
                  />
                  <Text style={styles.paymentMethodText}>NetBanking</Text>
                  {paymentMethod === 'netbanking' && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#E88801"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.proceedButton,
                (!amount ||
                  isNaN(parseFloat(amount)) ||
                  parseFloat(amount) <= 0) &&
                  styles.disabledButton,
                processingPayment && styles.disabledButton,
              ]}
              onPress={handleAddMoney}
              disabled={
                !amount ||
                isNaN(parseFloat(amount)) ||
                parseFloat(amount) <= 0 ||
                processingPayment
              }>
              {processingPayment ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.proceedButtonText}>PROCEED TO PAY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#777',
  },
  lowBalanceBadge: {
    backgroundColor: '#fef0e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowBalanceText: {
    color: '#E88801',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  addMoneyButton: {
    backgroundColor: '#E88801',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addMoneyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  warningCard: {
    backgroundColor: '#fef0e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  transactionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyTransactionsText: {
    marginTop: 10,
    color: '#777',
    fontSize: 14,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditIcon: {
    backgroundColor: '#4CAF50',
  },
  debitIcon: {
    backgroundColor: '#F44336',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditText: {
    color: '#4CAF50',
  },
  debitText: {
    color: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    padding: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    width: '23%',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodOption: {
    width: '30%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  selectedPaymentMethod: {
    borderColor: '#E88801',
    backgroundColor: '#fef0e6',
  },
  paymentMethodIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  proceedButton: {
    backgroundColor: '#E88801',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  proceedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WalletScreen;
